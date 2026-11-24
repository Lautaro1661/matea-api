/**
 * Seed: carga datos de ejemplo coherentes con el front de MateA.
 * Uso: npm run seed
 * ⚠️ BORRA el contenido actual de las colecciones users, categories y cursos.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Curso = require('./models/cursoModel');

const usuarios = [
  { nombre: 'Admin MateA', email: 'admin@matea.com', password: 'Admin123!', rol: 'admin' },
  { nombre: 'Mariana Gómez', email: 'mariana@matea.com', password: 'Instructor123!', rol: 'instructor' },
  { nombre: 'Diego Fernández', email: 'diego@matea.com', password: 'Instructor123!', rol: 'instructor' },
  { nombre: 'Lucía Torres', email: 'lucia@example.com', password: 'Alumno123!', rol: 'alumno', categoriaInteres: 'idiomas', origen: 'redes' },
  { nombre: 'Martín Pérez', email: 'martin@example.com', password: 'Alumno123!', rol: 'alumno', categoriaInteres: 'programacion', origen: 'buscador' },
];

const categorias = [
  {
    nombre: 'Programación e Inteligencia Artificial',
    descripcion: 'Desde los fundamentos de la programación hasta los modelos de IA más avanzados. Aprendé las habilidades del futuro, hoy.',
    tag: 'Tecnología',
    imagen: '/img/categorias-programacion.png',
  },
  {
    nombre: 'Negocios y Marketing',
    descripcion: 'Estrategias de marketing digital, gestión empresarial y liderazgo para llevar tu carrera o emprendimiento al siguiente nivel.',
    tag: 'Negocios',
    imagen: '/img/categorias-administracion.png',
  },
  {
    nombre: 'Idiomas e Inglés',
    descripcion: 'Aprendé inglés con una metodología práctica y conversacional. Abrí puertas en el mundo laboral y académico internacional.',
    tag: 'Idiomas',
    imagen: '/img/categorias-idioma.png',
  },
];

// Cada curso indica el slug de su categoría y el email de su instructor
const cursos = [
  {
    titulo: 'Programación e Inteligencia Artificial',
    descripcion: 'Aprendé Python, machine learning y los modelos de IA más usados en la industria. Un recorrido práctico desde los fundamentos hasta proyectos reales.',
    precio: 25000, cupos: 120, nivel: 'intermedio', imagen: '/img/Programacion-IA.png',
    categoriaSlug: 'programacion-e-inteligencia-artificial', instructorEmail: 'mariana@matea.com',
    temario: [
      { orden: 1, titulo: 'Fundamentos de Python', duracionMin: 40 },
      { orden: 2, titulo: 'Introducción al machine learning', duracionMin: 55 },
      { orden: 3, titulo: 'Tu primer proyecto con IA', duracionMin: 60 },
    ],
  },
  {
    titulo: 'Marketing Digital',
    descripcion: 'Estrategias de contenido, publicidad en redes sociales, SEO y analítica web. Todo lo que necesitás para hacer crecer cualquier negocio en línea.',
    precio: 18000, cupos: 150, nivel: 'principiante', imagen: '/img/Marketing-Digital.png',
    categoriaSlug: 'negocios-y-marketing', instructorEmail: 'diego@matea.com',
    temario: [
      { orden: 1, titulo: 'Estrategia de contenidos', duracionMin: 30 },
      { orden: 2, titulo: 'Publicidad en redes sociales', duracionMin: 45 },
      { orden: 3, titulo: 'SEO y analítica web', duracionMin: 50 },
    ],
  },
  {
    titulo: 'Administración de Empresas',
    descripcion: 'Gestión de equipos, planificación estratégica y finanzas básicas para emprendedores y profesionales que quieren liderar con confianza.',
    precio: 20000, cupos: 100, nivel: 'intermedio', imagen: '/img/Administracion-de-empresas.png',
    categoriaSlug: 'negocios-y-marketing', instructorEmail: 'diego@matea.com',
    temario: [
      { orden: 1, titulo: 'Liderazgo y gestión de equipos', duracionMin: 35 },
      { orden: 2, titulo: 'Planificación estratégica', duracionMin: 45 },
    ],
  },
  {
    titulo: 'Inglés: de Cero a Avanzado',
    descripcion: 'Metodología conversacional con hablantes nativos. Avanzá a tu propio ritmo y alcanzá la fluidez que necesitás para el trabajo y la vida cotidiana.',
    precio: 12000, cupos: 200, nivel: 'principiante', imagen: '/img/Ingles.png',
    categoriaSlug: 'idiomas-e-ingles', instructorEmail: 'mariana@matea.com',
    temario: [
      { orden: 1, titulo: 'Presentaciones y vocabulario básico', duracionMin: 25 },
      { orden: 2, titulo: 'Conversación cotidiana', duracionMin: 30 },
      { orden: 3, titulo: 'Inglés para el trabajo', duracionMin: 35 },
    ],
  },
  {
    titulo: 'Diseño UX/UI',
    descripcion: 'Aprendé a diseñar interfaces intuitivas y atractivas con Figma. Desde la investigación de usuarios hasta la entrega de prototipos listos para desarrollo.',
    precio: 22000, cupos: 80, nivel: 'intermedio', imagen: '/img/UX.png',
    categoriaSlug: 'programacion-e-inteligencia-artificial', instructorEmail: 'mariana@matea.com',
    temario: [
      { orden: 1, titulo: 'Investigación de usuarios', duracionMin: 40 },
      { orden: 2, titulo: 'Wireframes y prototipos en Figma', duracionMin: 55 },
    ],
  },
  {
    titulo: 'Excel y Análisis de Datos',
    descripcion: 'Dominá fórmulas avanzadas, tablas dinámicas y visualizaciones. Transformá datos en decisiones con herramientas que usan millones de profesionales.',
    precio: 15000, cupos: 180, nivel: 'principiante', imagen: '/img/excel.png',
    categoriaSlug: 'negocios-y-marketing', instructorEmail: 'diego@matea.com',
    temario: [
      { orden: 1, titulo: 'Fórmulas esenciales', duracionMin: 30 },
      { orden: 2, titulo: 'Tablas dinámicas', duracionMin: 40 },
      { orden: 3, titulo: 'Gráficos y dashboards', duracionMin: 45 },
    ],
  },
];

const seed = async () => {
  await connectDB();

  console.log('🧹 Limpiando colecciones...');
  await Promise.all([Curso.deleteMany({}), Category.deleteMany({}), User.deleteMany({})]);

  // create() (y no insertMany) para que corra el pre-save hook de bcrypt
  const usersCreados = await User.create(usuarios);
  const categoriasCreadas = await Category.create(categorias);
  console.log(`👤 ${usersCreados.length} usuarios | 🏷️  ${categoriasCreadas.length} categorías`);

  const idCategoria = Object.fromEntries(categoriasCreadas.map((c) => [c.slug, c._id]));
  const idUsuario = Object.fromEntries(usersCreados.map((u) => [u.email, u._id]));

  const cursosCreados = await Curso.create(
    cursos.map(({ categoriaSlug, instructorEmail, ...resto }) => ({
      ...resto,
      categoria: idCategoria[categoriaSlug],
      instructor: idUsuario[instructorEmail],
    }))
  );
  console.log(`📚 ${cursosCreados.length} cursos`);

  console.log('\n✅ Seed completado. Usuarios de prueba:');
  console.log('   admin@matea.com      / Admin123!       (admin)');
  console.log('   mariana@matea.com    / Instructor123!  (instructor)');
  console.log('   diego@matea.com      / Instructor123!  (instructor)');
  console.log('   lucia@example.com    / Alumno123!      (alumno)');

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error('❌ Error en el seed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
