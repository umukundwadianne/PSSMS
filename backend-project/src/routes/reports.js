const express = require('express');
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const Car = require('../models/Car');
const ParkingSlot = require('../models/ParkingSlot');
const { authRequired } = require('../middleware/authRequired');

const router = express.Router();

// Daily payment report
// GET /api/reports/daily-payments?date=YYYY-MM-DD
router.get('/daily-payments', authRequired, async (req, res) => {
  try {
    const dateStr = req.query.date;
    if (!dateStr) return res.status(400).json({ message: 'date query is required (YYYY-MM-DD)' });

    const day = new Date(dateStr);
    if (Number.isNaN(day.getTime())) return res.status(400).json({ message: 'Invalid date format' });

    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const payments = await Payment.find({ paymentDate: { $gte: start, $lte: end } }).sort({ paymentDate: 1 });

    // Enrich data
    const parkingRecordIds = payments.map((p) => p.parkingRecordId);
    const records = await ParkingRecord.find({ _id: { $in: parkingRecordIds } });
    const recordById = new Map(records.map((r) => [String(r._id), r]));

    const plateNumbers = records.map((r) => r.plateNumber);
    const cars = await Car.find({ plateNumber: { $in: plateNumbers } });
    const carByPlate = new Map(cars.map((c) => [String(c.plateNumber), c]));

    const slotNumbers = records.map((r) => r.slotNumber);
    const slots = await ParkingSlot.find({ slotNumber: { $in: slotNumbers } });
    const slotByNumber = new Map(slots.map((s) => [Number(s.slotNumber), s]));

    const rows = payments.map((p) => {
      const record = recordById.get(String(p.parkingRecordId)) || null;
      const car = record ? carByPlate.get(String(record.plateNumber)) || null : null;
      const slot = record ? slotByNumber.get(Number(record.slotNumber)) || null : null;

      return {
        paymentId: p._id,
        amountPaid: p.amountPaid,
        paymentDate: p.paymentDate,
        parkingRecordId: p.parkingRecordId,
        slotNumber: record ? record.slotNumber : null,
        plateNumber: record ? record.plateNumber : null,
        driverName: car ? car.driverName : null,
        phoneNumber: car ? car.phoneNumber : null,
        slotStatus: slot ? slot.slotStatus : null,
        entryTime: record ? record.entryTime : null,
        exitTime: record ? record.exitTime : null,
      };
    });

    res.json({ date: dateStr, paymentsCount: rows.length, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
