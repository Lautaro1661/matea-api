require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const cursoRoute = require('./src/routes/cursoRoute');
const categoryRoute = require('./src/routes/categoryRoute');
const userRoute = require('./src/routes/userRoute');

const app = express();

// ---------- Middlewares globales ----------
app.use(cors()); // Habilita CORS (el front de React corre en otro puerto)
app.use(express.json());

// ---------- Rutas ----------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de MateA funcionando',
    endpoints: ['/api/cursos', '/api/categorias', '/api/usuarios'],
  });
});

app.use('/api/cursos', cursoRoute);
app.use('/api/categorias', categoryRoute);
app.use('/api/usuarios', userRoute);

// ---------- 404 para rutas inexistentes ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ---------- Errores globales (JSON mal formado, etc.) ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'El JSON enviado es inválido' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

// ---------- Arranque ----------
const PORT = process.env.PORT || 3000;

// Solo se conecta y escucha si se ejecuta directamente (node app.js)
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`));
  });
}

module.exports = app;
