/**
 * Custom Error class for validation errors
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

module.exports = ValidationError;
