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
  WAREHOUSE_MANAGER: 'Cannot delete because warehouse {warehouse} is being managed by this user. Please transfer the warehouse to another user before deleting.',
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