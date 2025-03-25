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

  // Lấy thông tin phiếu nhập kho theo ID
  static async getExchangeNoteById(exchangeNote_id) {
    try {
        const [noteInfo] = await pool.query(`
            SELECT 
                en.exchangeNote_id,
                en.transactionType,
                en.status,
                en.date,
                en.created_by,
                en.approved_by,
                COALESCE(en.source_warehouse_code, en.destination_warehouse_code) AS warehouse_code,
                w.warehouse_name,
                w.address,
                ni.noteItem_id,
                ni.noteItem_code,
                ni.quantity AS noteItem_quantity,
                p.product_code,
                p.product_name,
                p.size,
                p.color
            FROM ExchangeNote en
            LEFT JOIN Warehouse w ON w.warehouse_code = COALESCE(en.source_warehouse_code, en.destination_warehouse_code)
            LEFT JOIN NoteItem ni ON en.exchangeNote_id = ni.exchangeNote_id
            LEFT JOIN Product p ON ni.product_code = p.product_code
            WHERE en.exchangeNote_id = ?;
        `, [exchangeNote_id]);
        
        if (!noteInfo || noteInfo.length === 0) {
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
        console.error("Lỗi khi lấy thông tin phiếu nhập/xuất kho:", error);
        throw error;
    }
}

  // Lấy danh sách phiếu nhập kho
  static async getAllExchangeNotes() {
    try {
      const [notes] = await pool.query(`
       SELECT exchangeNote_id, transactionType, status, created_by, approved_by, date, destination_warehouse_code, source_warehouse_code
        FROM ExchangeNote 
        ORDER BY date DESC
      `);
      return notes;
      
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phiếu nhập kho:", error);
      throw error;
    }
  }

  // Approve
  static async approveExchangeNote(exchangeNoteId, approvedBy) {
    try {
        const [checkResult] = await pool.query(
            "SELECT status FROM ExchangeNote WHERE exchangeNote_id = ?",
            [exchangeNoteId]
        );

        if (checkResult.length === 0) {
            throw new Error("ExchangeNote không tồn tại.");
        }

        if (checkResult[0].status !== "pending") {
            throw new Error("Chỉ có thể duyệt phiếu khi trạng thái là PENDING.");
        }

        await pool.query(
            "UPDATE ExchangeNote SET status = 'accepted', approved_by = ? WHERE exchangeNote_id = ?",
            [approvedBy, exchangeNoteId]
        );
        return { success: true, message: "Phiếu ExchangeNote đã được duyệt thành công." };
    } catch (error) {
        console.error("❌ Lỗi khi duyệt ExchangeNote:", error);
        throw error;
    }
  }

  static async updateExchangeNoteStatus(exchangeNoteId, newStatus, approvedBy) {
    try {
        console.log("📩 Nhận request cập nhật ExchangeNote:", exchangeNoteId);
        console.log("🔍 Trạng thái mới:", newStatus);
        console.log("🔍 Người duyệt:", approvedBy);

        // 1️⃣ Kiểm tra phiếu nhập kho - Sửa lại tên cột
        const [checkResult] = await pool.query(
            `SELECT status, transactionType, destination_warehouse_id 
             FROM ExchangeNote 
             WHERE exchangeNote_id = ?`,
            [exchangeNoteId]
        );

        if (checkResult.length === 0) {
            throw new Error("ExchangeNote không tồn tại.");
        }

        let { status, transactionType, destination_warehouse_id } = checkResult[0];

        if (status !== "accepted") {
            throw new Error("Chỉ có thể cập nhật phiếu khi trạng thái là APPROVED.");
        }

        // Sử dụng đúng tên biến
        const warehouse_code = destination_warehouse_id;
        console.log(`📦 Cập nhật số lượng sản phẩm vào kho: ${warehouse_code}`);

        // 2️⃣ Cập nhật trạng thái phiếu
        await pool.query(
            "UPDATE ExchangeNote SET status = ?, approved_by = ? WHERE exchangeNote_id = ?",
            [newStatus, approvedBy, exchangeNoteId]
        );

        // 3️⃣ Nếu phiếu bị REJECTED, không cập nhật số lượng sản phẩm
        if (newStatus === "rejected") {
            console.log("🚫 Phiếu bị từ chối, không cập nhật số lượng sản phẩm.");
            return { success: true, message: "Phiếu ExchangeNote đã bị từ chối." };
        }

        // 4️⃣ Nếu phiếu là FINISHED, cập nhật số lượng sản phẩm vào kho
        if (newStatus === "finished" && transactionType === "IMPORT") {
            console.log("📦 Cập nhật số lượng sản phẩm vào kho:", warehouse_code);

            const [noteItems] = await pool.query(
                `SELECT ni.product_code, ni.quantity, p.product_name, p.size, p.color, p.productType_code
                 FROM NoteItem ni
                 JOIN Product p ON ni.product_code = p.product_code
                 WHERE ni.exchangeNote_id = ?`,
                [exchangeNoteId]
            );

            for (const item of noteItems) {
                console.log(`🔄 Kiểm tra sản phẩm ${item.product_code} trong kho ${warehouse_code}`);

                // Kiểm tra sản phẩm đã có trong bảng Product chưa
                const [productCheck] = await pool.query(
                    `SELECT * FROM Product WHERE product_code = ?`,
                    [item.product_code]
                );

                if (productCheck.length > 0) {
                    // Nếu sản phẩm đã tồn tại, cập nhật số lượng
                    await pool.query(
                        `UPDATE Product 
                         SET quantity = quantity + ? 
                         WHERE product_code = ?`,
                        [item.quantity, item.product_code]
                    );
                    console.log(`✅ Tăng số lượng sản phẩm ${item.product_code} lên ${item.quantity}`);
                } else {
                    // Nếu sản phẩm chưa tồn tại, thêm mới vào kho
                    await pool.query(
                        `INSERT INTO Product (product_id, product_code, product_name, size, color, quantity, status, productType_code) 
                         VALUES (UUID(), ?, ?, ?, ?, ?, 'instock', ?)`,
                        [item.product_code, item.product_name, item.size, item.color, item.quantity, item.productType_code]
                    );
                    console.log(`✅ Thêm mới sản phẩm ${item.product_code} vào kho ${warehouse_code}`);
                }
            }

            console.log("✅ Cập nhật số lượng hoàn tất!");
            return { success: true, message: "Phiếu ExchangeNote đã hoàn tất và cập nhật số lượng sản phẩm." };
        }

        return { success: true, message: "Cập nhật trạng thái phiếu thành công." };
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật trạng thái ExchangeNote:", error);
        throw error;
    }
}


}

module.exports = ExchangeNote;