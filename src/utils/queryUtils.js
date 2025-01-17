const generateSelectUserFields = () => `
    SELECT 
        u.role_id, 
        r.role_name, 
        u.user_code,
        u.user_name, 
        u.fullName, 
        u.email, 
        u.status, 
        u.created_at, 
        u.updated_at,
        u.warehouse_code, 
        w.warehouse_name, 
        w.address
    FROM User u 
    JOIN Role r ON u.role_id = r.role_id
    LEFT JOIN Warehouse w ON u.warehouse_code = w.warehouse_code
`;

const generateSelectUserWithPassword = () => `
    SELECT 
        u.*, 
        r.role_name,
        w.warehouse_name, 
        w.address
    FROM User u 
    JOIN Role r ON u.role_id = r.role_id
    LEFT JOIN Warehouse w ON u.warehouse_code = w.warehouse_code
`;

module.exports = {
    generateSelectUserFields,
    generateSelectUserWithPassword
};