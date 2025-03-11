const User = require('../models/userModel');
const { USER_MESSAGES } = require('../constants/messages');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

exports.getUserByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.getByCode(code);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: USER_MESSAGES.USER_NOT_FOUND
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    if (newUser.full_name) {
      newUser.fullName = newUser.full_name;
      delete newUser.full_name;
    }
    
    return res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.message.includes('exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create user'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { code } = req.params;
    const updatedUser = await User.update(code, req.body);
    
    if (updatedUser.full_name) {
      updatedUser.fullName = updatedUser.full_name;
      delete updatedUser.full_name;
    }
    
    return res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.message === USER_MESSAGES.USER_NOT_FOUND) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === USER_MESSAGES.NO_UPDATE_DATA) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { code } = req.params;
    const deletedUser = await User.delete(code);
    
    if (deletedUser.full_name) {
      deletedUser.fullName = deletedUser.full_name;
      delete deletedUser.full_name;
    }
    
    return res.status(200).json({
      success: true,
      message: USER_MESSAGES.DELETE_SUCCESS,
      data: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error.message === USER_MESSAGES.USER_NOT_FOUND) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === USER_MESSAGES.LAST_ADMIN || 
        error.message.includes('warehouse')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
};