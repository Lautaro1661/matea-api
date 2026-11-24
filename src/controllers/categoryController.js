const categoryService = require('../services/categoryService');
const handleError = require('../utils/handleError');

const getAll = async (req, res) => {
  try {
    const categorias = await categoryService.getAll();
    res.status(200).json({ success: true, count: categorias.length, data: categorias });
  } catch (error) {
    handleError(res, error);
  }
};

const getById = async (req, res) => {
  try {
    const categoria = await categoryService.getById(req.params.id);
    res.status(200).json({ success: true, data: categoria });
  } catch (error) {
    handleError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const categoria = await categoryService.create(req.body || {});
    res.status(201).json({ success: true, message: 'Categoría creada correctamente', data: categoria });
  } catch (error) {
    handleError(res, error);
  }
};

const remove = async (req, res) => {
  try {
    const categoria = await categoryService.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Categoría eliminada correctamente', data: categoria });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAll, getById, create, remove };
