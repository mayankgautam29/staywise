const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  usernm: {
    type: String,
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending','accepted','rejected'],
    default: 'pending'
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
