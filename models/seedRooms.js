require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./rooms');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/stayw';
const rooms = [
  {
    id: 1,
    title: "Deluxe King Room",
    description: "Spacious room with a comfortable king-sized bed, modern amenities, and a beautiful city view.",
    price: 150,
    maxOccupancy: 2,
    imageUrls: [
      "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"
    ]
  },
  {
    id: 2,
    title: "Standard Double Room",
    description: "Comfortable room with two double beds, perfect for friends or family stays.",
    price: 120,
    maxOccupancy: 4,
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
    ]
  },
  {
    id: 3,
    title: "Suite with Balcony",
    description: "Luxurious suite with a private balcony overlooking the ocean, includes a king bed and lounge area.",
    price: 250,
    maxOccupancy: 3,
    imageUrls: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32"
    ]
  },
  {
    id: 4,
    title: "Economy Single Room",
    description: "Cozy single room with essential amenities, ideal for solo travelers.",
    price: 80,
    maxOccupancy: 1,
    imageUrls: [
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg"
    ]
  },
  {
    id: 5,
    title: "Family Room",
    description: "Large room with two queen beds and a sofa bed, perfect for families with kids.",
    price: 180,
    maxOccupancy: 5,
    imageUrls: [
      "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg"
    ]
  }
];
async function seedDb() {
    try {
        await mongoose.connect(dbUrl);
        console.log('DB Connected');
        await Room.deleteMany({});
        console.log('Cleared rooms collection');
        await Room.insertMany(rooms);
        console.log('Rooms inserted');
        mongoose.connection.close();
    } catch(err) {
        console.log(err);
    }
}
seedDb();