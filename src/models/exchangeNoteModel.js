const pool = require('../config/dbConfig');
const { v4: uuidv4 } = require('uuid');

class ExchangeNote {
  // Tạo mã phiếu nhập/xuất mới
  static async generateExchangeNoteCode() {
    try {
      const [lastCode] = await pool.query(
        'SELECT exchangeNote_id FROM ExchangeNote ORDER BY exchangeNote_id DESC LIMIT 1'
      );
      let newCode = 'EX0001';
      if (lastCode[0]) {
        const lastNumber = parseInt(lastCode[0].exchangeNote_id.substring(2));
        newCode = `EX${(lastNumber + 1).toString().padStart(4, '0')}`;
      }
      return newCode;
    } catch (error) {
      console.error('Lỗi khi tạo mã phiếu nhập/xuất:', error);
      throw error;
    }
  }

  // Tạo code cho item trong phiếu
  static async generateNoteItemCode() {
    try {
      const timestamp = new Date().getTime();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const newCode = `NI${timestamp.toString().slice(-6)}${randomPart}`;
      
      const [existing] = await pool.query(
        'SELECT noteItem_code FROM NoteItem WHERE noteItem_code = ?',
        [newCode]
      );
      
      if (existing.length > 0) {
        return this.generateNoteItemCode();
      }
      
      console.log("NoteItem_code được tạo:", newCode);
      return newCode;
    } catch (error) {
      console.error('Lỗi khi tạo NoteItem_code:', error);
      throw error;
    }
  }

  // Tạo phiếu nhập kho
  static async createImportNote(importData, user) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { warehouse_code, source_warehouse_id, source_type, items, is_system_import } = importData;
      
      // is_system_import để xác định đây là nhập vào SYSTEM hay vào WAREHOUSE
      const isSystemImport = is_system_import === true;
      
      if (!isSystemImport && !warehouse_code) {
        throw new Error("Thiếu mã kho nhập hàng");
      }
      
      if (!items || items.length === 0) {
        throw new Error("Thiếu thông tin sản phẩm nhập kho");
      }
      
      const sourceType = source_type || 'EXTERNAL';
      
      // Kiểm tra số lượng trong hệ thống nếu sourceType là SYSTEM
      if (sourceType === 'SYSTEM') {
        for (const item of items) {
          const { product_code, quantity } = item;

          const [productResult] = await connection.query(
            'SELECT product_name, quantity FROM Product WHERE product_code = ?',
            [product_code]
          );
          
          if (productResult.length === 0) {
            throw new Error(`Sản phẩm với mã ${product_code} không tồn tại`);
          }
          
          const availableQuantity = productResult[0].quantity;
          const productName = productResult[0].product_name;
          
          if (availableQuantity < quantity) {
            throw new Error(`Không đủ số lượng sản phẩm ${productName} (${product_code}) trong hệ thống. Hiện có: ${availableQuantity}, Cần: ${quantity}`);
          }
        }
      }
      
      if (sourceType === 'INTERNAL' && !source_warehouse_id) {
        throw new Error("Cần chỉ định kho nguồn cho loại nhập INTERNAL");
      }
      
      if (source_warehouse_id) {
        const [sourceExists] = await connection.query(
          'SELECT * FROM Warehouse WHERE warehouse_code = ?',
          [source_warehouse_id]
        );
        
        if (sourceExists.length === 0) {
          throw new Error("Kho nguồn không tồn tại");
        }
      }
    
      if (!isSystemImport && warehouse_code) {
        const [warehouseExists] = await connection.query(
          'SELECT * FROM Warehouse WHERE warehouse_code = ?',
          [warehouse_code]
        );
        
        if (warehouseExists.length === 0) {
          throw new Error("Kho nhập không tồn tại");
        }
      }
      
      const exchangeNote_id = uuidv4();
      const date = new Date();
      
      const destinationWarehouse = isSystemImport ? null : warehouse_code;
      
      await connection.query(`
        INSERT INTO ExchangeNote (
          exchangeNote_id, 
          warehouse_code, 
          transactionType, 
          status,
          source_type,
          source_warehouse_id, 
          destination_warehouse_id, 
          created_by, 
          date
        ) VALUES (?, ?, 'IMPORT', 'pending', ?, ?, ?, ?, ?)`,
        [
          exchangeNote_id, 
          warehouse_code || 'SYSTEM', 
          sourceType,
          source_warehouse_id || null,
          destinationWarehouse,  
          user.userCode, 
          date
        ]
      );

      for (const item of items) {
        const { product_code, quantity } = item;
        
        if (!product_code || !quantity || quantity <= 0) {
          throw new Error("Thông tin sản phẩm không hợp lệ");
        }
        const [productExists] = await connection.query(
          'SELECT * FROM Product WHERE product_code = ?',
          [product_code]
        );
        
        if (productExists.length === 0) {
          throw new Error(`Sản phẩm với mã ${product_code} không tồn tại`);
        }
        
        const noteItem_id = uuidv4();
        const timestamp = new Date().getTime();
        const noteItem_code = `NI${timestamp.toString().slice(-10)}`;
        
        await connection.query(`
          INSERT INTO NoteItem (
            noteItem_id, 
            noteItem_code, 
            product_code, 
            warehouse_code, 
            exchangeNote_id, 
            quantity
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            noteItem_id, 
            noteItem_code, 
            product_code, 
            isSystemImport ? null : warehouse_code, // Nếu nhập vào SYSTEM, warehouse_code không cần nhập
            exchangeNote_id, 
            quantity
          ]
        );
      }
      
      const [noteInfo] = await connection.query(`
        SELECT e.*, 
               CASE WHEN e.warehouse_code = 'SYSTEM' THEN 'Hệ thống' ELSE w.warehouse_name END as warehouse_name, 
               u.full_name as created_by_name
        FROM ExchangeNote e
        LEFT JOIN Warehouse w ON e.warehouse_code = w.warehouse_code
        JOIN User u ON e.created_by = u.user_code
        WHERE e.exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      // Lấy thông tin các mục trong phiếu
      const [itemsInfo] = await connection.query(`
        SELECT ni.*, p.product_name, p.size, p.color
        FROM NoteItem ni
        JOIN Product p ON ni.product_code = p.product_code
        WHERE ni.exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      await connection.commit();
      
      return {
        note: noteInfo[0],
        items: itemsInfo
      };
      
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi khi tạo phiếu nhập kho:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Lấy thông tin phiếu nhập kho theo ID
  static async getImportNoteById(exchangeNote_id) {
    try {
      const [noteInfo] = await pool.query(`
        SELECT e.*, w.warehouse_name, u.full_name as created_by_name,
               u2.full_name as approved_by_name
        FROM ExchangeNote e
        JOIN Warehouse w ON e.warehouse_code = w.warehouse_code
        JOIN User u ON e.created_by = u.user_code
        LEFT JOIN User u2 ON e.approved_by = u2.user_code
        WHERE e.exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      if (noteInfo.length === 0) {
        return null;
      }
      
      const [itemsInfo] = await pool.query(`
        SELECT ni.*, p.product_name, p.size, p.color
        FROM NoteItem ni
        JOIN Product p ON ni.product_code = p.product_code
        WHERE ni.exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      return {
        note: noteInfo[0],
        items: itemsInfo
      };
      
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phiếu nhập kho:", error);
      throw error;
    }
  }

  // Lấy danh sách phiếu nhập kho
  static async getAllImportNotes() {
    try {
      const [notes] = await pool.query(`
      SELECT *
        FROM ExchangeNote 
      `);
      
      return notes;
      
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phiếu nhập kho:", error);
      throw error;
    }
  }

  // Duyệt phiếu nhập kho
  static async approveImportNote(exchangeNote_id, approvedBy) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      await connection.query(`
        UPDATE ExchangeNote 
        SET status = 'accepted', approved_by = ?
        WHERE exchangeNote_id = ? AND status = 'pending'
      `, [approvedBy, exchangeNote_id]);
      
      const [updateResult] = await connection.query(`
        SELECT ROW_COUNT() as affectedRows
      `);
      
      if (updateResult[0].affectedRows === 0) {
        throw new Error("Không thể duyệt phiếu hoặc phiếu không ở trạng thái chờ duyệt");
      }
      
      await connection.commit();
      
      return { success: true, message: "Duyệt phiếu nhập kho thành công" };
      
    } catch (error) {
        await connection.rollback();
        console.error("Lỗi khi duyệt phiếu nhập kho:", error);
        throw error;
      } finally {
        connection.release();
    }
  }

  static async completeImportNote(exchangeNote_id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const [noteInfo] = await connection.query(`
        SELECT * FROM ExchangeNote WHERE exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      if (noteInfo.length === 0) {
        throw new Error("Phiếu không tồn tại");
      }
      
      if (noteInfo[0].status !== 'accepted') {
        throw new Error("Phiếu chưa được duyệt!");
      }
      
      const [items] = await connection.query(`
        SELECT ni.*, p.product_name 
        FROM NoteItem ni
        JOIN Product p ON ni.product_code = p.product_code
        WHERE ni.exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      const sourceType = noteInfo[0].source_type || 'EXTERNAL';
      const transactionType = noteInfo[0].transactionType;
      const sourceWarehouse = noteInfo[0].source_warehouse_id;
      const destinationWarehouse = noteInfo[0].destination_warehouse_id;
      
      console.log(`Hoàn thành phiếu ${exchangeNote_id}: ${transactionType}, sourceType: ${sourceType}`);
      console.log(`Nguồn: ${sourceWarehouse}, Đích: ${destinationWarehouse}`);
      
      // Nếu source là SYSTEM, kiểm tra số lượng sản phẩm
      if (sourceType === 'SYSTEM') {
        for (const item of items) {
          const [productResult] = await connection.query(
            'SELECT quantity FROM Product WHERE product_code = ?',
            [item.product_code]
          );
          
          if (productResult.length === 0) {
            throw new Error(`Sản phẩm với mã ${item.product_code} không tồn tại`);
          }
          
          const availableQuantity = productResult[0].quantity;
          
          if (availableQuantity < item.quantity) {
            throw new Error(`Không đủ số lượng sản phẩm ${item.product_name} (${item.product_code}) trong hệ thống. Hiện có: ${availableQuantity}, Cần: ${item.quantity}`);
          }
        }
      }
      
      for (const item of items) {
        if (transactionType === 'IMPORT') {
          if (sourceType === 'EXTERNAL') {
            // Xác định xem đây là nhập vào kho hay nhập vào hệ thống dựa vào destinationWarehouse
            if (destinationWarehouse) {
              // Nhập từ bên ngoài vào kho cụ thể: KHÔNG CẦN cập nhật số lượng trong hệ thống (Product table)
              console.log(`Nhập ${item.quantity} sản phẩm ${item.product_code} từ bên ngoài vào kho ${destinationWarehouse}`);
              // Không thực hiện UPDATE vào bảng Product
            } else {
              // Nhập từ bên ngoài vào hệ thống: Cập nhật số lượng trong hệ thống
              console.log(`Nhập ${item.quantity} sản phẩm ${item.product_code} từ bên ngoài vào hệ thống`);
              await connection.query(`
                UPDATE Product 
                SET quantity = quantity + ?,
                    status = CASE WHEN (quantity + ?) > 0 THEN 'instock' ELSE status END
                WHERE product_code = ?
              `, [item.quantity, item.quantity, item.product_code]);
            }
          } 
          else if (sourceType === 'SYSTEM') {
            // Nếu là SYSTEM: Giảm số lượng trong SYSTEM
            console.log(`Nhập ${item.quantity} sản phẩm ${item.product_code} từ hệ thống vào kho ${destinationWarehouse}`);
            await connection.query(`
              UPDATE Product 
              SET quantity = quantity - ?,
                  status = CASE WHEN (quantity - ?) > 0 THEN 'instock' ELSE 'outofstock' END
              WHERE product_code = ?
            `, [item.quantity, item.quantity, item.product_code]);
          }
          else if (sourceType === 'INTERNAL' && sourceWarehouse) {
            // Nếu là INTERNAL: Cần nhập sourceWarehouse và destinationWarehouse
            console.log(`Chuyển ${item.quantity} sản phẩm ${item.product_code} từ kho ${sourceWarehouse} sang kho ${destinationWarehouse}`);
            const [warehouseStock] = await connection.query(`
              SELECT 
                (
                  COALESCE((
                    SELECT SUM(ni.quantity)
                    FROM NoteItem ni
                    JOIN ExchangeNote e ON ni.exchangeNote_id = e.exchangeNote_id
                    WHERE ni.product_code = ?
                    AND e.status = 'finished'
                    AND e.transactionType = 'IMPORT'
                    AND e.destination_warehouse_id = ?
                  ), 0)
                  -
                  COALESCE((
                    SELECT SUM(ni.quantity)
                    FROM NoteItem ni
                    JOIN ExchangeNote e ON ni.exchangeNote_id = e.exchangeNote_id
                    WHERE ni.product_code = ?
                    AND e.status = 'finished'
                    AND e.transactionType = 'EXPORT'
                    AND e.source_warehouse_id = ?
                  ), 0)
                ) as quantity_in_warehouse
            `, [item.product_code, sourceWarehouse, item.product_code, sourceWarehouse]);
            
            const availableInWarehouse = warehouseStock[0].quantity_in_warehouse || 0;
            
            if (availableInWarehouse < item.quantity) {
              throw new Error(`Không đủ số lượng sản phẩm ${item.product_name} (${item.product_code}) trong kho ${sourceWarehouse}. Hiện có: ${availableInWarehouse}, Cần: ${item.quantity}`);
            }
            
            const exportNoteId = uuidv4();
            const now = new Date();
          
            await connection.query(`
              INSERT INTO ExchangeNote (
                exchangeNote_id, 
                warehouse_code,
                transactionType, 
                status, 
                source_type,
                source_warehouse_id, 
                destination_warehouse_id, 
                created_by, 
                approved_by,
                date
              ) VALUES (?, ?, 'EXPORT', 'finished', 'INTERNAL', ?, ?, ?, ?, ?)
            `, [
              exportNoteId, 
              sourceWarehouse,
              sourceWarehouse,
              destinationWarehouse,
              noteInfo[0].created_by,
              noteInfo[0].approved_by,
              now
            ]);
            
            const exportItemId = uuidv4();
            const timestamp = new Date().getTime();
            const exportItemCode = `NI${timestamp.toString().slice(-10)}`;
            
            await connection.query(`
              INSERT INTO NoteItem (
                noteItem_id, 
                noteItem_code, 
                product_code, 
                warehouse_code, 
                exchangeNote_id, 
                quantity
              ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
              exportItemId,
              exportItemCode,
              item.product_code,
              sourceWarehouse,
              exportNoteId,
              item.quantity
            ]);
          }
        } 
        else if (transactionType === 'EXPORT') {
          console.log(`Xuất ${item.quantity} sản phẩm ${item.product_code} từ kho ${sourceWarehouse}`);
        
          const [warehouseStock] = await connection.query(`
            SELECT 
              (
                COALESCE((
                  SELECT SUM(ni.quantity)
                  FROM NoteItem ni
                  JOIN ExchangeNote e ON ni.exchangeNote_id = e.exchangeNote_id
                  WHERE ni.product_code = ?
                  AND e.status = 'finished'
                  AND e.transactionType = 'IMPORT'
                  AND e.destination_warehouse_id = ?
                ), 0)
                -
                COALESCE((
                  SELECT SUM(ni.quantity)
                  FROM NoteItem ni
                  JOIN ExchangeNote e ON ni.exchangeNote_id = e.exchangeNote_id
                  WHERE ni.product_code = ?
                  AND e.status = 'finished'
                  AND e.transactionType = 'EXPORT'
                  AND e.source_warehouse_id = ?
                ), 0)
              ) as quantity_in_warehouse
          `, [item.product_code, sourceWarehouse, item.product_code, sourceWarehouse]);
          
          const availableInWarehouse = warehouseStock[0].quantity_in_warehouse || 0;
          
          if (availableInWarehouse < item.quantity) {
            throw new Error(`Không đủ số lượng sản phẩm ${item.product_name} (${item.product_code}) trong kho ${sourceWarehouse}. Hiện có: ${availableInWarehouse}, Cần: ${item.quantity}`);
          }
          
          // Giảm số lượng sản phẩm
          await connection.query(`
            UPDATE Product 
            SET quantity = quantity - ?,
                status = CASE WHEN (quantity - ?) > 0 THEN 'instock' ELSE 'outofstock' END
            WHERE product_code = ?
          `, [item.quantity, item.quantity, item.product_code]);
        }
      }
      
      // Cập nhật trạng thái
      await connection.query(`
        UPDATE ExchangeNote SET status = 'finished' WHERE exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      await connection.commit();
      
      return { success: true, message: "Hoàn thành phiếu thành công" };
      
    } catch (error) {
      await connection.rollback();
      console.error("Lỗi khi hoàn thành phiếu:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
  // Từ chối phiếu nhập kho
  static async rejectImportNote(exchangeNote_id, rejectedBy) {
  try {
    const [noteStatus] = await pool.query(`
      SELECT status FROM ExchangeNote WHERE exchangeNote_id = ?
    `, [exchangeNote_id]);
    
    if (noteStatus.length === 0) {
      throw new Error("Phiếu không tồn tại");
    }
    
    // Chỉ cho phép từ chối phiếu ở trạng thái accepted
    if (noteStatus[0].status !== 'accepted') {
      throw new Error("Chỉ có thể từ chối phiếu đã được duyệt (accepted)");
    }
    
    const [result] = await pool.query(`
      UPDATE ExchangeNote 
      SET status = 'rejected', approved_by = ?
      WHERE exchangeNote_id = ? AND status = 'accepted'
    `, [rejectedBy, exchangeNote_id]);
    
    if (result.affectedRows === 0) {
      throw new Error("Không thể từ chối phiếu");
    }
    
    return { success: true, message: "Phiếu nhập kho đã bị từ chối!" };
    
  } catch (error) {
      console.error("Lỗi khi từ chối phiếu nhập kho:", error);
      throw error;
    } 
  }
}

module.exports = ExchangeNote;