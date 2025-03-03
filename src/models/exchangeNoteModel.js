const pool = require("../config/dbConfig");
const { v4: uuidv4 } = require("uuid");

class ExchangeNote {
    static async getAll() {
        try {
            const [exchangeNotes] = await pool.query(`
                SELECT 
                    e.exchangeNote_id, e.warehouse_code, e.type, e.status, e.created_by, e.date,
                    u.full_name AS created_by_name,
                    w.warehouse_name
                FROM ExchangeNote e
                JOIN User u ON e.created_by = u.user_code
                JOIN Warehouse w ON e.warehouse_code = w.warehouse_code
                ORDER BY e.date DESC
            `);
    
            if (exchangeNotes.length === 0) {
                return { pending: [], approved: [], rejected: [] };
            }
    
            // Lấy tất cả sản phẩm trong các phiếu nhập/xuất
            const exchangeNoteIds = exchangeNotes.map(e => e.exchangeNote_id);
            const placeholders = exchangeNoteIds.map(() => "?").join(",");
    
            const [noteItems] = await pool.query(`
                SELECT 
                    n.exchangeNote_id, n.product_code, n.quantity,
                    p.product_name, p.size, p.color
                FROM NoteItem n
                JOIN Product p ON n.product_code = p.product_code
                WHERE n.exchangeNote_id IN (${placeholders})
            `, exchangeNoteIds);
    
            // Gom nhóm sản phẩm vào phiếu tương ứng
            const exchangeNoteMap = {
                pending: [],
                approved: [],
                rejected: []
            };
    
            exchangeNotes.forEach(note => {
                const formattedNote = {
                    exchangeNote_id: note.exchangeNote_id,
                    warehouse: {
                        code: note.warehouse_code,
                        name: note.warehouse_name
                    },
                    type: note.type,
                    created_by: {
                        user_code: note.created_by,
                        full_name: note.created_by_name
                    },
                    date: note.date,
                    products: []
                };
    
                noteItems.forEach(item => {
                    if (item.exchangeNote_id === note.exchangeNote_id) {
                        formattedNote.products.push({
                            code: item.product_code,
                            name: item.product_name,
                            size: item.size,
                            color: item.color,
                            quantity: item.quantity
                        });
                    }
                });
    
                exchangeNoteMap[note.status].push(formattedNote);
            });
    
            return exchangeNoteMap;
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phiếu nhập/xuất:", error);
            throw error;
        }
    }

    static async approve(exchangeNoteId, status, approvedBy) {
        try {
            // 1️⃣ Kiểm tra xem phiếu có tồn tại không
            const [exchangeNotes] = await pool.query(`
                SELECT * FROM ExchangeNote WHERE exchangeNote_id = ? AND status = 'pending'
            `, [exchangeNoteId]);

            if (exchangeNotes.length === 0) {
                throw new Error("Phiếu nhập/xuất không tồn tại hoặc đã được xử lý.");
            }

            const exchangeNote = exchangeNotes[0];

            // 2️⃣ Nếu từ chối phiếu, chỉ cập nhật trạng thái
            if (status === 'rejected') {
                await pool.query(`
                    UPDATE ExchangeNote SET status = 'rejected', approved_by = ? WHERE exchangeNote_id = ?
                `, [approvedBy, exchangeNoteId]);
            
                // Cập nhật trạng thái sản phẩm thành "outofstock"
                await pool.query(`
                    UPDATE Product SET status = 'outofstock' WHERE product_code IN (
                        SELECT product_code FROM NoteItem WHERE exchangeNote_id = ?
                    )
                `, [exchangeNoteId]);
            
                return { success: true, message: "Phiếu nhập/xuất đã bị từ chối. Sản phẩm được giữ lại nhưng có trạng thái 'outofstock'." };
            }

            // 3️⃣ Nếu duyệt phiếu, cập nhật kho
            if (status === 'approved') {
                // Lấy danh sách sản phẩm trong phiếu nhập/xuất
                const [noteItems] = await pool.query(`
                    SELECT product_code, quantity FROM NoteItem WHERE exchangeNote_id = ?
                `, [exchangeNoteId]);

                if (noteItems.length === 0) {
                    throw new Error("Không có sản phẩm nào trong phiếu nhập/xuất.");
                }

                // Thêm sản phẩm vào kho
                for (const item of noteItems) {
                    await pool.query(`
                        INSERT INTO Stock (stock_id, stock_code, warehouse_code, product_code, quantity)
                        VALUES (UUID(), ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
                    `, [`ST${Math.floor(Math.random() * 10000)}`, exchangeNote.warehouse_code, item.product_code, item.quantity]);
                }

                // Cập nhật trạng thái phiếu nhập
                await pool.query(`
                    UPDATE ExchangeNote SET status = 'approved', approved_by = ? WHERE exchangeNote_id = ?
                `, [approvedBy, exchangeNoteId]);

                return { success: true, message: "Phiếu nhập/xuất đã được duyệt và cập nhật vào kho." };
            }

            throw new Error("Trạng thái không hợp lệ.");
        } catch (error) {
            console.error("Lỗi khi duyệt phiếu nhập/xuất:", error);
            throw error;
        }
    }

    static async createImportNote(warehouse_code, created_by, products) {
        try {
            if (!warehouse_code || !created_by || !products || products.length === 0) {
                throw new Error(`Thông tin phiếu nhập không hợp lệ. warehouse_code: ${warehouse_code}, created_by: ${created_by}, products: ${JSON.stringify(products)}`);
            }

            // 1️⃣ Kiểm tra kho có tồn tại không
            const [warehouse] = await pool.query(`
                SELECT * FROM Warehouse WHERE warehouse_code = ?`, 
                [warehouse_code]
            );

            if (warehouse.length === 0) {
                throw new Error("Kho hàng không tồn tại.");
            }

            // 2️⃣ Kiểm tra sản phẩm có tồn tại không
            const productCodes = products.map(p => p.product_code);
            const placeholders = productCodes.map(() => "?").join(",");
            const [existingProducts] = await pool.query(`
                SELECT product_code FROM Product WHERE product_code IN (${placeholders})`, 
                productCodes
            );

            const existingProductCodes = existingProducts.map(p => p.product_code);
            const invalidProducts = productCodes.filter(code => !existingProductCodes.includes(code));

            if (invalidProducts.length > 0) {
                throw new Error(`Sản phẩm không hợp lệ: ${invalidProducts.join(", ")}`);
            }

            // 3️⃣ Tạo phiếu nhập kho
            const exchangeNoteId = uuidv4();
            await pool.query(`
                INSERT INTO ExchangeNote (exchangeNote_id, warehouse_code, type, status, created_by, date)
                VALUES (?, ?, 'import', 'pending', ?, NOW())`, 
                [exchangeNoteId, warehouse_code, created_by]
            );

            // 4️⃣ Thêm sản phẩm vào bảng NoteItem
            for (const product of products) {
                const noteItemId = uuidv4();
                await pool.query(`
                    INSERT INTO NoteItem (noteItem_id, noteItem_code, product_code, exchangeNote_id, quantity)
                    VALUES (?, ?, ?, ?, ?)`, 
                    [noteItemId, `NI${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, 
                    product.product_code, exchangeNoteId, product.quantity]
                );
            }

            return { success: true, message: "Phiếu nhập kho đã được tạo, chờ duyệt.", exchangeNoteId };
        } catch (error) {
            console.error("Lỗi khi tạo phiếu nhập kho:", error);
            throw error;
        }
    }
}

module.exports = ExchangeNote;
