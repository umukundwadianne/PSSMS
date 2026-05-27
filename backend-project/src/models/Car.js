const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    driverName: {
      type: String,
      required: true,
      trim: true,
      // letters only (no digits). Allows spaces and common separators.
      validate: {
        validator: (v) => {
          const value = String(v || '').trim().replace(/\s+/g, ' ');
          // Only alphabets and spaces; no signs/punctuation and no numbers.
          return /^[\p{L}\s]+$/u.test(value) && !/[0-9]/.test(value);
        },
        message: 'driverName must contain only alphabets (no numbers/symbols)',
      },
    },
    phoneNumber: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);

