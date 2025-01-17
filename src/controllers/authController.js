const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authController = {
    async login(req, res) {
        try {
            const { user_name, password } = req.body;
            const user = await User.findByUsernameWithPassword(user_name);
      
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Username or password incorrect'
                });
            }

            if (password !== user.password) {
                return res.status(401).json({
                    success: false,
                     message: 'Username or password incorrect'
                });
            }

            const token = jwt.sign(
                { 
                    user_id: user.user_id,
                    user_code: user.user_code,
                    role_id: user.role_id, 
                    user_name: user.user_name
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Login successfully!',
                data: {
                    token,
                    user: {
                        user_code: user.user_code,
                        user_name: user.user_name,
                        fullName: user.fullName,
                            email: user.email,
                        role_id: user.role_id,
                        role_name: user.role_name,
                        warehouse_code: user.warehouse_code,
                        warehouse_name: user.warehouse_name,
                        address: user.address,
                        status: user.status
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
};

module.exports = authController;