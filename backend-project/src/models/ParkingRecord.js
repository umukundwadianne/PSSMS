const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema(
  {
    slotNumber: { type: Number, required: true, index: true },
    plateNumber: { type: String, required: true, index: true, uppercase: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);

