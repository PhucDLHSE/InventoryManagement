exports.USER_MESSAGES = {
  MISSING_FIELDS: "Please input require fields: role_id, user_name, fullName, email, password",
  INVALID_EMAIL: "Email invalid format!",
  ROLE_INVALID: 'Role_id invalid!',
  USERNAME_EXISTS: 'Username existed',
  NO_UPDATE_DATA: 'No information being updated!',
  USER_NOT_FOUND: 'Can not find user!',
  CANNOT_UPDATE: 'Can not find user to update',
  CANNOT_DELETE: 'Cannot find user to delete',
  LAST_ADMIN: 'Cannot delete the last admin',
  WAREHOUSE_MANAGER: 'Cannot delete because warehouse {"warehouse"} is being managed by this user. Please transfer the warehouse to another user before deleting.',
  DELETE_SUCCESS: "User delete successfully!"
};

exports.WAREHOUSE_MESSAGES = {
  GET_ALL_SUCCESS: "Get all warehouses successfully",
  GET_SUCCESS: "Get warehouse successfully",
  CREATE_SUCCESS: "Warehouse created successfully",
  UPDATE_SUCCESS: "Warehouse updated successfully",
  DELETE_SUCCESS: "Warehouse deleted successfully",
  NOT_FOUND: "Warehouse not found",
  NAME_EXISTS: "Warehouse name already exists",
  MISSING_FIELDS: "Warehouse name and address are required",
  NO_UPDATE_DATA: "No data to update",
  HAS_USERS: "Cannot delete warehouse with assigned users",
  HAS_STOCK: "Cannot delete warehouse with existing stock"
};

exports.CATEGORY_MESSAGES = {
  GET_ALL_SUCCESS: "Get all categories successfully",
  GET_SUCCESS: "Get category successfully",
  CREATE_SUCCESS: "Category created successfully",
  UPDATE_SUCCESS: "Category updated successfully",
  DELETE_SUCCESS: "Category deleted successfully",
  NOT_FOUND: "Category not found",
  NAME_EXISTS: "Category name already exists",
  NAME_REQUIRED: "Category name is required",
  USED_IN_PRODUCT_TYPE: "Cannot delete category that is used in product types"
};

exports.PRODUCT_TYPE_MESSAGES = {
  GET_ALL_SUCCESS: "Get all product types successfully",
  GET_SUCCESS: "Get product type successfully",
  GET_BY_CATEGORY_SUCCESS: "Get product types by category successfully",
  CREATE_SUCCESS: "Product type created successfully",
  UPDATE_SUCCESS: "Product type updated successfully",
  DELETE_SUCCESS: "Product type deleted successfully",
  NOT_FOUND: "Product type not found",
  NAME_EXISTS: "Product type name already exists",
  MISSING_FIELDS: "Product type name and category are required",
  NO_UPDATE_DATA: "No data to update",
  CATEGORY_NOT_FOUND: "Category not found",
  USED_IN_PRODUCT: "Cannot delete product type that is used in products"
};

exports.PRODUCT_MESSAGES = {
  GET_ALL_SUCCESS: "Get all products successfully",
  GET_SUCCESS: "Get product successfully",
  GET_BY_PRODUCT_TYPE_SUCCESS: "Get products by product type successfully",
  CREATE_SUCCESS: "Product created successfully",
  UPDATE_SUCCESS: "Product updated successfully",
  UPDATE_STOCK_SUCCESS: "Product stock updated successfully",
  DELETE_SUCCESS: "Product deleted successfully",
  NOT_FOUND: "Product not found",
  MISSING_FIELDS: "Product name, size, color, quantity and product type are required",
  NO_UPDATE_DATA: "No data to update",
  PRODUCT_TYPE_NOT_FOUND: "Product type not found",
  USED_IN_STOCK: "Cannot delete product that is used in stock",
  INVALID_QUANTITY: "Invalid quantity"
};