const Joi = require('joi');
const bookingValidationSchema = Joi.object({
  usernm: Joi.string().required(),
  room: Joi.string().hex().length(24).required(),
  checkIn: Joi.date().required(),
  checkOut: Joi.date()
    .required()
    .greater(Joi.ref('checkIn'))
    .messages({
      'date.greater': 'Check-out date must be after check-in date.'
    })
});
module.exports = bookingValidationSchema;