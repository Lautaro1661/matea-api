const mongoose = require('mongoose');

// Lección embebida dentro del curso (no se reutiliza fuera de él)
const leccionSchema = new mongoose.Schema(
  {
    orden: { type: Number, required: [true, 'El orden de la lección es obligatorio'], min: 1 },
    titulo: { type: String, required: [true, 'El título de la lección es obligatorio'], trim: true },
    duracionMin: { type: Number, required: [true, 'La duración de la lección es obligatoria'], min: 1 },
  },
  { _id: false }
);

const cursoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [120, 'El título no puede superar los 120 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      maxlength: [1000, 'La descripción no puede superar los 1000 caracteres'],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    // Equivale al "Stock" de la consigna: cupo máximo de alumnos
    cupos: {
      type: Number,
      required: [true, 'Los cupos son obligatorios'],
      min: [0, 'Los cupos no pueden ser negativos'],
      validate: { validator: Number.isInteger, message: 'Los cupos deben ser un número entero' },
    },
    // Referencia a la colección categories
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },
    // Referencia al usuario instructor que dicta el curso
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El instructor es obligatorio'],
    },
    nivel: {
      type: String,
      enum: { values: ['principiante', 'intermedio', 'avanzado'], message: 'Nivel inválido (principiante, intermedio o avanzado)' },
      default: 'principiante',
    },
    // Ruta de la imagen (ej: "/img/Ingles.png")
    imagen: { type: String, trim: true },
    temario: { type: [leccionSchema], default: [] },
    fechaPublicacion: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);

// Índices (ver README)
cursoSchema.index({ categoria: 1 });
cursoSchema.index({ instructor: 1 });
cursoSchema.index({ titulo: 'text', descripcion: 'text' }, { default_language: 'spanish' });

module.exports = mongoose.model('Curso', cursoSchema);
