const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
      maxlength: [60, 'El nombre no puede superar los 60 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción de la categoría es obligatoria'],
      trim: true,
      maxlength: [300, 'La descripción no puede superar los 300 caracteres'],
    },
    // Etiqueta que muestra el front en la galería (ej: "Tecnología")
    tag: { type: String, trim: true },
    // Ruta de la imagen (ej: "/img/categorias-programacion.png")
    imagen: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

// El slug se genera solo a partir del nombre
categorySchema.pre('validate', function () {
  if (this.nombre && (this.isModified('nombre') || !this.slug)) {
    this.slug = slugify(this.nombre);
  }
});

module.exports = mongoose.model('Category', categorySchema);
