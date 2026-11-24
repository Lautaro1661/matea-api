const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

const generarToken = (user) => {
  if (!process.env.JWT_SECRET) throw new AppError('Falta configurar JWT_SECRET en el servidor', 500);
  return jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

/**
 * Registro público: siempre crea usuarios con rol "alumno".
 * (Los roles instructor/admin se asignan por fuera, ej. con el seed.)
 */
const register = async (data) => {
  const { nombre, email, password, telefono, categoriaInteres, origen } = data;

  if (!nombre || !email || !password) {
    throw new AppError('Nombre, email y contraseña son obligatorios', 400);
  }

  const existente = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existente) throw new AppError('Ya existe un usuario registrado con ese email', 409);

  // .create() dispara el pre-save hook que hashea la contraseña
  const user = await User.create({ nombre, email, password, telefono, categoriaInteres, origen, rol: 'alumno' });

  return { user, token: generarToken(user) };
};

const login = async (data) => {
  const { email, password } = data;

  if (!email || !password) throw new AppError('Email y contraseña son obligatorios', 400);

  // El password tiene select:false, hay que pedirlo explícitamente
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');

  // Mensaje genérico a propósito: no revela si el email existe
  if (!user || !(await user.comparePassword(String(password)))) {
    throw new AppError('Credenciales inválidas', 401);
  }

  return { user, token: generarToken(user) };
};

const getProfile = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user;
};

module.exports = { register, login, getProfile };
