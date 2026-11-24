const AppError = require('./AppError');

/**
 * Traduce cualquier error a una respuesta HTTP coherente.
 * 400 validación / ID inválido, 409 duplicados, 500 error inesperado.
 */
const handleError = (res, error) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Error de validación', errors });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Valor inválido para "${error.path}"` });
  }

  if (error.code === 11000) {
    const campo = Object.keys(error.keyPattern || {})[0] || 'campo';
    return res.status(409).json({ success: false, message: `Ya existe un registro con ese ${campo}` });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: 'Error interno del servidor' });
};

module.exports = handleError;
