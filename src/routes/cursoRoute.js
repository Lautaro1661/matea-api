const express = require('express');
const cursoController = require('../controllers/cursoController');
const { verifyToken, authorizeRoles } = require('../middleware/verifyToken');

const router = express.Router();

// Públicas (las usa el front para mostrar el catálogo)
router.get('/', cursoController.getAll);
router.get('/:id', cursoController.getById);

// Protegidas con JWT: crear, actualizar y eliminar
router.post('/', verifyToken, authorizeRoles('admin', 'instructor'), cursoController.create);
router.put('/:id', verifyToken, authorizeRoles('admin', 'instructor'), cursoController.update);
router.delete('/:id', verifyToken, authorizeRoles('admin', 'instructor'), cursoController.remove);

module.exports = router;
