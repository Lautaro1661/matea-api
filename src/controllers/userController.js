const userService = require('../services/userService');
const handleError = require('../utils/handleError');

const register = async (req, res) => {
  try {
    const { user, token } = await userService.register(req.body || {});
    res.status(201).json({ success: true, message: 'Usuario registrado correctamente', data: { user, token } });
  } catch (error) {
    handleError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const { user, token } = await userService.login(req.body || {});
    res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', data: { user, token } });
  } catch (error) {
    handleError(res, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { register, login, getProfile };
