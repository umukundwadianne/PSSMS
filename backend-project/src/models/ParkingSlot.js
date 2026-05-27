const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: { type: Number, required: true, unique: true },
    slotStatus: { type: String, default: 'available', enum: ['available', 'occupied', 'disabled'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);

