const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    parkingRecordId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true, ref: 'ParkingRecord' },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

