const express = require('express');
const ParkingRecord = require('../models/ParkingRecord');
const Car = require('../models/Car');
const ParkingSlot = require('../models/ParkingSlot');
const { authRequired } = require('../middleware/authRequired');

const router = express.Router();

async function validateRecord(body, { requireExitTime = false } = {}) {
  if (body.slotNumber === undefined || body.slotNumber === null || body.slotNumber === '') {
    return { error: 'slotNumber is required' };
  }

  const slotNumber = Number(body.slotNumber);
  const plateNumber = String(body.plateNumber || '').trim().toUpperCase();
  const entryTime = String(body.entryTime || '').trim();
  const exitTime = body.exitTime === null || body.exitTime === undefined ? '' : String(body.exitTime).trim();

  if (!Number.isInteger(slotNumber) || slotNumber <= 0) {
    return { error: 'slotNumber must be a positive whole number' };
  }

  if (!plateNumber) {
    return { error: 'plateNumber is required' };
  }

  if (!entryTime) {
    return { error: 'entryTime is required' };
  }

  const entry = new Date(entryTime);
  if (Number.isNaN(entry.getTime())) {
    return { error: 'entryTime must be a valid date' };
  }

  const slot = await ParkingSlot.findOne({ slotNumber });
  if (!slot) {
    return { error: 'Selected parking slot does not exist' };
  }

  const car = await Car.findOne({ plateNumber });
  if (!car) {
    return { error: 'Selected car does not exist' };
  }

  const value = { slotNumber, plateNumber, entryTime: entry };

  // Business rules based on slot status:
  // - When creating an entry (requireExitTime === false): slot must be AVAILABLE
  // - When setting an exit (requireExitTime === true): slot must be OCCUPIED
  if (requireExitTime) {
    if (slot.slotStatus !== 'occupied') {
      return { error: `Slot ${slotNumber} is not occupied.` };
    }
  } else {
    if (slot.slotStatus !== 'available') {
      return { error: `Slot ${slotNumber} is not available.` };
    }
  }

  if (requireExitTime && !exitTime) {
    return { error: 'exitTime is required' };
  }


  if (exitTime) {
    const exit = new Date(exitTime);
    if (Number.isNaN(exit.getTime())) {
      return { error: 'exitTime must be a valid date' };
    }
    if (exit < entry) {
      return { error: 'exitTime cannot be before entryTime' };
    }
    value.exitTime = exit;
  } else {
    value.exitTime = null;
  }

  return { value };
}

router.get('/', authRequired, async (req, res) => {
  const records = await ParkingRecord.find().sort({ createdAt: -1 });
  res.json(records);
});

router.get('/:id', authRequired, async (req, res) => {
  const record = await ParkingRecord.findById(req.params.id);
  if (!record) return res.status(404).json({ message: 'Parking record not found' });
  res.json(record);
});

router.post('/', authRequired, async (req, res) => {
  try {
    const result = await validateRecord(req.body);
    if (result.error) return res.status(400).json({ message: result.error });

    const openRecord = await ParkingRecord.findOne({
      plateNumber: result.value.plateNumber,
      exitTime: null,
    });
    if (openRecord) return res.status(409).json({ message: 'This car already has an open parking record' });

    const created = await ParkingRecord.create(result.value);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const result = await validateRecord(req.body);
    if (result.error) return res.status(400).json({ message: result.error });

    const openRecord = await ParkingRecord.findOne({
      plateNumber: result.value.plateNumber,
      exitTime: null,
      _id: { $ne: req.params.id },
    });
    if (!result.value.exitTime && openRecord) {
      return res.status(409).json({ message: 'This car already has another open parking record' });
    }

    const updated = await ParkingRecord.findByIdAndUpdate(req.params.id, result.value, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Parking record not found' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/exit', authRequired, async (req, res) => {
  try {
    const existing = await ParkingRecord.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Parking record not found' });

    const result = await validateRecord(
      {
        slotNumber: existing.slotNumber,
        plateNumber: existing.plateNumber,
        entryTime: existing.entryTime,
        exitTime: req.body.exitTime,
      },
      { requireExitTime: true }
    );
    if (result.error) return res.status(400).json({ message: result.error });

    existing.exitTime = result.value.exitTime;
    await existing.save();
    res.json(existing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const deleted = await ParkingRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Parking record not found' });
    res.json({ message: 'Parking record deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
