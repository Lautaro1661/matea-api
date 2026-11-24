const mongoose = require('mongoose');
const Curso = require('../models/cursoModel');
const Category = require('../models/categoryModel');
const AppError = require('../utils/AppError');

// Campos que el cliente puede enviar (evita asignaciones no deseadas)
const CAMPOS_PERMITIDOS = ['titulo', 'descripcion', 'precio', 'cupos', 'categoria', 'nivel', 'imagen', 'temario', 'fechaPublicacion'];

// populate: categoría completa + solo el nombre del instructor (no se expone su email)
const populateCurso = (query) => query.populate('categoria').populate('instructor', 'nombre');

const validarId = (id, nombre = 'curso') => {
  if (!mongoose.isValidObjectId(id)) throw new AppError(`El ID del ${nombre} no es válido`, 400);
};

const pick = (obj = {}, campos) =>
  campos.reduce((acc, campo) => {
    if (obj[campo] !== undefined) acc[campo] = obj[campo];
    return acc;
  }, {});

const verificarCategoria = async (categoriaId) => {
  if (!mongoose.isValidObjectId(categoriaId)) throw new AppError('El ID de la categoría no es válido', 400);
  const existe = await Category.exists({ _id: categoriaId });
  if (!existe) throw new AppError('La categoría indicada no existe', 404);
};

// Solo el admin o el instructor dueño del curso puede modificarlo/eliminarlo
const verificarPermiso = (curso, user) => {
  const esDueno = String(curso.instructor) === String(user.id);
  if (user.rol !== 'admin' && !esDueno) {
    throw new AppError('No tenés permiso para modificar este curso', 403);
  }
};

/**
 * Filtros opcionales: categoria (ID o slug), nivel, instructor, q (búsqueda de texto)
 */
const getAll = async (filtros = {}) => {
  const query = {};

  if (filtros.categoria) {
    if (mongoose.isValidObjectId(filtros.categoria)) {
      query.categoria = filtros.categoria;
    } else {
      const category = await Category.findOne({ slug: String(filtros.categoria).toLowerCase() });
      if (!category) return []; // slug inexistente: no hay cursos
      query.categoria = category._id;
    }
  }

  if (filtros.nivel) query.nivel = filtros.nivel;

  if (filtros.instructor) {
    validarId(filtros.instructor, 'instructor');
    query.instructor = filtros.instructor;
  }

  if (filtros.q) query.$text = { $search: String(filtros.q) };

  return populateCurso(Curso.find(query).sort({ fechaPublicacion: -1 }));
};

const getById = async (id) => {
  validarId(id);
  const curso = await populateCurso(Curso.findById(id));
  if (!curso) throw new AppError('Curso no encontrado', 404);
  return curso;
};

const create = async (data, user) => {
  const datos = pick(data, CAMPOS_PERMITIDOS);
  await verificarCategoria(datos.categoria);

  // El instructor es quien crea el curso; solo un admin puede asignar otro
  let instructor = user.id;
  if (user.rol === 'admin' && data.instructor) {
    validarId(data.instructor, 'instructor');
    instructor = data.instructor;
  }

  const curso = await Curso.create({ ...datos, instructor });
  return getById(curso._id);
};

const update = async (id, data, user) => {
  validarId(id);
  const curso = await Curso.findById(id);
  if (!curso) throw new AppError('Curso no encontrado', 404);
  verificarPermiso(curso, user);

  const cambios = pick(data, CAMPOS_PERMITIDOS);
  if (cambios.categoria) await verificarCategoria(cambios.categoria);

  if (user.rol === 'admin' && data.instructor) {
    validarId(data.instructor, 'instructor');
    cambios.instructor = data.instructor;
  }

  curso.set(cambios);
  await curso.save(); // corre las validaciones del esquema
  return getById(curso._id);
};

const remove = async (id, user) => {
  validarId(id);
  const curso = await Curso.findById(id);
  if (!curso) throw new AppError('Curso no encontrado', 404);
  verificarPermiso(curso, user);

  await curso.deleteOne();
  return curso;
};

module.exports = { getAll, getById, create, update, remove };
