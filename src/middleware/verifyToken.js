const jwt = require('jsonwebtoken');

/**
 * Verifica el JWT enviado en el header: Authorization: Bearer <token>
 * Si es válido deja los datos del usuario en req.user = { id, rol }.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [tipo, token] = authHeader.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Acceso denegado: falta el token (Authorization: Bearer <token>)' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, rol: decoded.rol };
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'El token expiró, iniciá sesión nuevamente' : 'Token inválido';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Autorización por rol. Se usa DESPUÉS de verifyToken.
 * Ej: authorizeRoles('admin', 'instructor')
 */
const authorizeRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ success: false, message: 'No tenés permisos para realizar esta acción' });
  }
  next();
};

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.authorizeRoles = authorizeRoles;
