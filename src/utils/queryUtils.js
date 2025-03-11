exports.generateSelectUserFields = () => {
    return `
      SELECT 
        u.user_id, u.user_code, u.user_name, u.full_name, 
        u.email, u.warehouse_code, u.status, u.created_at, u.updated_at,
        r.role_id, r.role_name, r.role_type,
        w.warehouse_name, w.address
      FROM User u
      JOIN Role r ON u.role_id = r.role_id
      LEFT JOIN Warehouse w ON u.warehouse_code = w.warehouse_code
    `;
  };
  
  exports.generateSelectUserWithPassword = () => {
    return `
      SELECT 
        u.*, r.role_name, r.role_type,
        w.warehouse_name, w.address
      FROM User u
      JOIN Role r ON u.role_id = r.role_id
      LEFT JOIN Warehouse w ON u.warehouse_code = w.warehouse_code
    `;
  };