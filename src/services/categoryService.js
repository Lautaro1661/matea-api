const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Curso = require('../models/cursoModel');
const AppError = require('../utils/AppError');

const validarId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('El ID de la categoría no es válido', 400);
};

const getAll = async () => {
  return Category.find().sort({ nombre: 1 });
};

const getById = async (id) => {
  validarId(id);
  const category = await Category.findById(id);
  if (!category) throw new AppError('Categoría no encontrada', 404);
  return category;
};

const create = async (data) => {
  const { nombre, descripcion, tag, imagen } = data;
  // El slug se genera automáticamente en el modelo
  return Category.create({ nombre, descripcion, tag, imagen });
};

const remove = async (id) => {
  validarId(id);

  const category = await Category.findById(id);
  if (!category) throw new AppError('Categoría no encontrada', 404);

  // Regla de negocio: no se puede borrar una categoría que tiene cursos
  const cursosAsociados = await Curso.countDocuments({ categoria: id });
  if (cursosAsociados > 0) {
    throw new AppError(
      `No se puede eliminar: la categoría tiene ${cursosAsociados} curso(s) asociado(s)`,
      409
    );
  }

  await category.deleteOne();
  return category;
};

module.exports = { getAll, getById, create, remove };
