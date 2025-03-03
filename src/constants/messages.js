exports.USER_MESSAGES = {
  MISSING_FIELDS: "Vui lòng nhập các trường bắt buộc: loại vai trò, tên người dùng, họ tên, email, mật khẩu",
  INVALID_EMAIL: "Email không đúng định dạng!",
  ROLE_TYPE_INVALID: "Loại vai trò không hợp lệ! Phải là một trong: ADMIN, MANAGER, STAFF",
  USERNAME_EXISTS: 'Tên người dùng đã tồn tại',
  NO_UPDATE_DATA: 'Không có thông tin nào được cập nhật!',
  USER_NOT_FOUND: 'Không tìm thấy người dùng!',
  CANNOT_UPDATE: 'Không thể tìm thấy người dùng để cập nhật',
  CANNOT_DELETE: 'Không thể tìm thấy người dùng để xóa',
  LAST_ADMIN: 'Không thể xóa admin cuối cùng',
  WAREHOUSE_MANAGER: 'Không thể xóa vì kho {"warehouse"} đang được quản lý bởi người dùng này. Vui lòng chuyển kho cho người dùng khác trước khi xóa.',
  WAREHOUSE_LAST_USER: 'Không thể xóa người dùng cuối cùng trong kho {warehouse}',
  WAREHOUSE_HAS_MANAGER: 'Kho này đã có một quản lý. Mỗi kho chỉ có thể có một quản lý.',
  WAREHOUSE_STAFF_LIMIT: 'Đã đạt giới hạn 5 nhân viên trong kho này.',
  WAREHOUSE_NOT_FOUND: 'Không tìm thấy kho',
  USER_HAS_STOCKCHECK: 'Không thể xóa người dùng đang quản lý phiếu kiểm kho',
  DELETE_SUCCESS: "Xóa người dùng thành công!"
};

exports.WAREHOUSE_MESSAGES = {
  GET_ALL_SUCCESS: "Lấy tất cả kho thành công",
  GET_SUCCESS: "Lấy thông tin kho thành công",
  CREATE_SUCCESS: "Tạo kho thành công",
  UPDATE_SUCCESS: "Cập nhật kho thành công",
  DELETE_SUCCESS: "Xóa kho thành công",
  NOT_FOUND: "Không tìm thấy kho",
  NAME_EXISTS: "Tên kho đã tồn tại",
  MISSING_FIELDS: "Tên kho và địa chỉ là bắt buộc",
  NO_UPDATE_DATA: "Không có dữ liệu để cập nhật",
  HAS_USERS: "Không thể xóa kho có người dùng được gán",
  HAS_STOCK: "Không thể xóa kho có tồn kho hiện tại"
};

exports.CATEGORY_MESSAGES = {
  GET_ALL_SUCCESS: "Lấy tất cả danh mục thành công",
  GET_SUCCESS: "Lấy thông tin danh mục thành công",
  CREATE_SUCCESS: "Tạo danh mục thành công",
  UPDATE_SUCCESS: "Cập nhật danh mục thành công",
  DELETE_SUCCESS: "Xóa danh mục thành công",
  NOT_FOUND: "Không tìm thấy danh mục",
  NAME_EXISTS: "Tên danh mục đã tồn tại",
  NAME_REQUIRED: "Tên danh mục là bắt buộc",
  USED_IN_PRODUCT_TYPE: "Không thể xóa danh mục đang được sử dụng trong loại sản phẩm"
};

exports.PRODUCT_TYPE_MESSAGES = {
  GET_ALL_SUCCESS: "Lấy tất cả loại sản phẩm thành công",
  GET_SUCCESS: "Lấy thông tin loại sản phẩm thành công",
  GET_BY_CATEGORY_SUCCESS: "Lấy loại sản phẩm theo danh mục thành công",
  CREATE_SUCCESS: "Tạo loại sản phẩm thành công",
  UPDATE_SUCCESS: "Cập nhật loại sản phẩm thành công",
  DELETE_SUCCESS: "Xóa loại sản phẩm thành công",
  NOT_FOUND: "Không tìm thấy loại sản phẩm",
  NAME_EXISTS: "Tên loại sản phẩm đã tồn tại",
  MISSING_FIELDS: "Tên loại sản phẩm và danh mục là bắt buộc",
  NO_UPDATE_DATA: "Không có dữ liệu để cập nhật",
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục",
  USED_IN_PRODUCT: "Không thể xóa loại sản phẩm đang được sử dụng trong sản phẩm"
};

exports.PRODUCT_MESSAGES = {
  GET_ALL_SUCCESS: "Lấy tất cả sản phẩm thành công",
  GET_SUCCESS: "Lấy thông tin sản phẩm thành công",
  GET_BY_PRODUCT_TYPE_SUCCESS: "Lấy sản phẩm theo loại sản phẩm thành công",
  CREATE_SUCCESS: "Tạo sản phẩm thành công",
  UPDATE_SUCCESS: "Cập nhật sản phẩm thành công",
  UPDATE_STOCK_SUCCESS: "Cập nhật tồn kho sản phẩm thành công",
  DELETE_SUCCESS: "Xóa sản phẩm thành công",
  NOT_FOUND: "Không tìm thấy sản phẩm",
  MISSING_FIELDS: "Tên sản phẩm, kích thước, màu sắc, số lượng và loại sản phẩm là bắt buộc",
  NO_UPDATE_DATA: "Không có dữ liệu để cập nhật",
  PRODUCT_TYPE_NOT_FOUND: "Không tìm thấy loại sản phẩm",
  USED_IN_STOCK: "Không thể xóa sản phẩm đang được sử dụng trong tồn kho",
  INVALID_QUANTITY: "Số lượng không hợp lệ",
  GET_BY_CATEGORY_SUCCESS: "Lấy sản phẩm theo danh mục thành công",
  SEARCH_SUCCESS: "Tìm kiếm sản phẩm thành công",
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục",
  SEARCH_TERM_REQUIRED: "Cần từ khóa tìm kiếm"
};