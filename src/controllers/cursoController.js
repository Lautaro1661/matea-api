const cursoService = require('../services/cursoService');
const handleError = require('../utils/handleError');

const getAll = async (req, res) => {
  try {
    const cursos = await cursoService.getAll(req.query);
    res.status(200).json({ success: true, count: cursos.length, data: cursos });
  } catch (error) {
    handleError(res, error);
  }
};

const getById = async (req, res) => {
  try {
    const curso = await cursoService.getById(req.params.id);
    res.status(200).json({ success: true, data: curso });
  } catch (error) {
    handleError(res, error);
  }
};

const create = async (req, res) => {
  try {
    const curso = await cursoService.create(req.body || {}, req.user);
    res.status(201).json({ success: true, message: 'Curso creado correctamente', data: curso });
  } catch (error) {
    handleError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const curso = await cursoService.update(req.params.id, req.body || {}, req.user);
    res.status(200).json({ success: true, message: 'Curso actualizado correctamente', data: curso });
  } catch (error) {
    handleError(res, error);
  }
};

const remove = async (req, res) => {
  try {
    const curso = await cursoService.remove(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Curso eliminado correctamente', data: curso });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getAll, getById, create, update, remove };
