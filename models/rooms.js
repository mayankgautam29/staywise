const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    maxOccupancy: Number,
    imageUrls: [String],
});

const Room = mongoose.model("Room",roomSchema);
module.exports = Room;
