/**
 * Error con código HTTP asociado. Los servicios lo lanzan y los
 * controladores lo traducen a una respuesta (ver handleError).
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
