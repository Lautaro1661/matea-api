const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [80, 'El nombre no puede superar los 80 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // nunca se devuelve en las consultas por defecto
    },
    rol: {
      type: String,
      enum: { values: ['admin', 'instructor', 'alumno'], message: 'Rol inválido' },
      default: 'alumno',
    },
    // Campos que vienen del formulario de registro del front
    telefono: { type: String, trim: true },
    categoriaInteres: { type: String, trim: true }, // slug de la categoría de interés
    origen: {
      type: String,
      enum: { values: ['redes', 'amigo', 'buscador'], message: 'Origen inválido' },
    },
    fechaRegistro: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Hook pre-save: hashea la contraseña con bcrypt antes de guardarla
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

// Compara una contraseña en texto plano contra el hash guardado
userSchema.methods.comparePassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

// Nunca exponer el password en las respuestas JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
