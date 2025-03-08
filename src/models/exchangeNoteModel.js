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

  // Tạo mã cho item trong phiếu
static async generateNoteItemCode() {
    try {
      // Tạo mã dựa trên timestamp để đảm bảo không trùng lặp
      const timestamp = new Date().getTime();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const newCode = `NI${timestamp.toString().slice(-6)}${randomPart}`;
      
      // Kiểm tra xem mã đã tồn tại chưa
      const [existing] = await pool.query(
        'SELECT noteItem_code FROM NoteItem WHERE noteItem_code = ?',
        [newCode]
      );
      
      if (existing.length > 0) {
        // Nếu trùng (rất hiếm), thử lại
        return this.generateNoteItemCode();
      }
      
      console.log("Mã NoteItem mới được tạo:", newCode);
      return newCode;
    } catch (error) {
      console.error('Lỗi khi tạo mã item phiếu:', error);
      throw error;
    }
  }

  // Tạo phiếu nhập kho
static async createImportNote(importData, user) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { warehouse_code, source_warehouse_id, source_type, items } = importData;
      
      if (!warehouse_code || !items || items.length === 0) {
        throw new Error("Thiếu thông tin bắt buộc cho phiếu nhập kho");
      }
      
      // Kiểm tra kho đích tồn tại
      const [warehouseExists] = await connection.query(
        'SELECT * FROM Warehouse WHERE warehouse_code = ?',
        [warehouse_code]
      );
      
      if (warehouseExists.length === 0) {
        throw new Error("Kho không tồn tại");
      }
      
      // Tạo phiếu nhập kho
      const exchangeNote_id = uuidv4();
      const date = new Date();
      
      // Xác định loại nguồn, mặc định là EXTERNAL nếu không được chỉ định
      const sourceType = source_type || 'EXTERNAL';
      
      // Kiểm tra kho nguồn nếu là INTERNAL (chuyển kho)
      if (sourceType === 'INTERNAL' && !source_warehouse_id) {
        throw new Error("Cần chỉ định kho nguồn cho loại nhập INTERNAL");
      }
      
      // Kiểm tra kho nguồn tồn tại (nếu có)
      if (source_warehouse_id) {
        const [sourceExists] = await connection.query(
          'SELECT * FROM Warehouse WHERE warehouse_code = ?',
          [source_warehouse_id]
        );
        
        if (sourceExists.length === 0) {
          throw new Error("Kho nguồn không tồn tại");
        }
      }
      
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
          warehouse_code, 
          sourceType,
          source_warehouse_id || null,
          warehouse_code,  // Kho đích là kho nhập
          user.userCode, 
          date
        ]
      );
      
      // Tạo các mục trong phiếu
      for (const item of items) {
        const { product_code, quantity } = item;
        
        if (!product_code || !quantity || quantity <= 0) {
          throw new Error("Thông tin sản phẩm không hợp lệ");
        }
        
        // Kiểm tra sản phẩm tồn tại
        const [productExists] = await connection.query(
          'SELECT * FROM Product WHERE product_code = ?',
          [product_code]
        );
        
        if (productExists.length === 0) {
          throw new Error(`Sản phẩm với mã ${product_code} không tồn tại`);
        }
        
        const noteItem_id = uuidv4();
        // Tạo mã có thời gian để đảm bảo duy nhất
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
            warehouse_code, 
            exchangeNote_id, 
            quantity
          ]
        );
      }
      
      // Lấy thông tin phiếu nhập vừa tạo
      const [noteInfo] = await connection.query(`
        SELECT e.*, w.warehouse_name, u.full_name as created_by_name
        FROM ExchangeNote e
        JOIN Warehouse w ON e.warehouse_code = w.warehouse_code
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
      // Lấy thông tin phiếu
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
      
      // Lấy thông tin các mục trong phiếu
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
        SELECT e.*, w.warehouse_name, u.full_name as created_by_name,
               u2.full_name as approved_by_name
        FROM ExchangeNote e
        JOIN Warehouse w ON e.warehouse_code = w.warehouse_code
        JOIN User u ON e.created_by = u.user_code
        LEFT JOIN User u2 ON e.approved_by = u2.user_code
        WHERE e.transactionType = 'IMPORT'
        ORDER BY e.date DESC
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
      
      // Cập nhật trạng thái phiếu
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

  // Hoàn thành phiếu nhập kho và cập nhật số lượng sản phẩm
  static async completeImportNote(exchangeNote_id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Kiểm tra trạng thái phiếu
      const [noteInfo] = await connection.query(`
        SELECT * FROM ExchangeNote WHERE exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      if (noteInfo.length === 0) {
        throw new Error("Phiếu không tồn tại");
      }
      
      if (noteInfo[0].status !== 'accepted') {
        throw new Error("Phiếu chưa được duyệt hoặc đã hoàn thành/từ chối");
      }
      
      // Lấy danh sách sản phẩm trong phiếu
      const [items] = await connection.query(`
        SELECT * FROM NoteItem WHERE exchangeNote_id = ?
      `, [exchangeNote_id]);
      
      // Lấy thông tin từ phiếu
      const sourceType = noteInfo[0].source_type || 'EXTERNAL';
      const transactionType = noteInfo[0].transactionType;
      const sourceWarehouse = noteInfo[0].source_warehouse_id;
      const destinationWarehouse = noteInfo[0].destination_warehouse_id;
      
      console.log(`Hoàn thành phiếu ${exchangeNote_id}: ${transactionType}, sourceType: ${sourceType}`);
      console.log(`Nguồn: ${sourceWarehouse}, Đích: ${destinationWarehouse}`);
      
      // Xử lý cập nhật số lượng sản phẩm
      for (const item of items) {
        if (transactionType === 'IMPORT') {
          if (sourceType === 'EXTERNAL') {
            // Nhập từ bên ngoài: Tăng số lượng
            console.log(`Nhập ${item.quantity} sản phẩm ${item.product_code} từ bên ngoài vào kho ${destinationWarehouse}`);
            await connection.query(`
              UPDATE Product 
              SET quantity = quantity + ?,
                  status = CASE WHEN (quantity + ?) > 0 THEN 'instock' ELSE status END
              WHERE product_code = ?
            `, [item.quantity, item.quantity, item.product_code]);
          } 
          else if (sourceType === 'SYSTEM') {
            // Nhập từ hệ thống: Giảm số lượng trong hệ thống
            console.log(`Nhập ${item.quantity} sản phẩm ${item.product_code} từ hệ thống vào kho ${destinationWarehouse}`);
            await connection.query(`
              UPDATE Product 
              SET quantity = quantity - ?,
                  status = CASE WHEN (quantity - ?) > 0 THEN 'instock' ELSE 'outofstock' END
              WHERE product_code = ?
            `, [item.quantity, item.quantity, item.product_code]);
          }
          else if (sourceType === 'INTERNAL' && sourceWarehouse) {
            // Chuyển kho (nhập từ kho khác): Cần thêm logic để xử lý chuyển kho
            console.log(`Chuyển ${item.quantity} sản phẩm ${item.product_code} từ kho ${sourceWarehouse} sang kho ${destinationWarehouse}`);
            
            // Tạo một phiếu xuất kho từ kho nguồn
            const exportNoteId = uuidv4();
            const now = new Date();
            
            // Tạo phiếu xuất cho kho nguồn
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
            
            // Tạo mục cho phiếu xuất
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
          // Xử lý phiếu xuất kho
          console.log(`Xuất ${item.quantity} sản phẩm ${item.product_code} từ kho ${sourceWarehouse}`);
          
          // Giảm số lượng sản phẩm
          await connection.query(`
            UPDATE Product 
            SET quantity = quantity - ?,
                status = CASE WHEN (quantity - ?) > 0 THEN 'instock' ELSE 'outofstock' END
            WHERE product_code = ?
          `, [item.quantity, item.quantity, item.product_code]);
        }
      }
      
      // Cập nhật trạng thái phiếu
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
      const [result] = await pool.query(`
        UPDATE ExchangeNote 
        SET status = 'rejected', approved_by = ?
        WHERE exchangeNote_id = ? AND status = 'pending'
      `, [rejectedBy, exchangeNote_id]);
      
      if (result.affectedRows === 0) {
        throw new Error("Không thể từ chối phiếu hoặc phiếu không ở trạng thái chờ duyệt");
      }
      
      return { success: true, message: "Từ chối phiếu nhập kho thành công" };
      
    } catch (error) {
      console.error("Lỗi khi từ chối phiếu nhập kho:", error);
      throw error;
    }
  }
}

module.exports = ExchangeNote;