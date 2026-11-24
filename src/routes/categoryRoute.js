const express = require('express');
const categoryController = require('../controllers/categoryController');
const { verifyToken, authorizeRoles } = require('../middleware/verifyToken');

const router = express.Router();

// Públicas
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Protegidas con JWT: solo admin
router.post('/', verifyToken, authorizeRoles('admin'), categoryController.create);
router.delete('/:id', verifyToken, authorizeRoles('admin'), categoryController.remove);

module.exports = router;
