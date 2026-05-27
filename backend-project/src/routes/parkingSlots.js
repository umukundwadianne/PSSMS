const express = require('express');
const ParkingSlot = require('../models/ParkingSlot');
const { authRequired } = require('../middleware/authRequired');

const router = express.Router();

const allowedStatuses = ['available', 'occupied', 'disabled'];

function validateSlot(body) {
  if (body.slotNumber === undefined || body.slotNumber === null || body.slotNumber === '') {
    return { error: 'slotNumber is required' };
  }

  const slotNumber = Number(body.slotNumber);
  const slotStatus = String(body.slotStatus || '').trim();

  if (!Number.isInteger(slotNumber) || slotNumber <= 0) {
    return { error: 'slotNumber must be a positive whole number' };
  }

  if (!slotStatus) {
    return { error: 'slotStatus is required' };
  }

  if (!allowedStatuses.includes(slotStatus)) {
    return { error: `slotStatus must be one of: ${allowedStatuses.join(', ')}` };
  }

  return { value: { slotNumber, slotStatus } };
}

router.get('/', authRequired, async (req, res) => {
  const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
  res.json(slots);
});

router.get('/:id', authRequired, async (req, res) => {
  const slot = await ParkingSlot.findById(req.params.id);
  if (!slot) return res.status(404).json({ message: 'Parking slot not found' });
  res.json(slot);
});

router.post('/', authRequired, async (req, res) => {
  try {
    const result = validateSlot(req.body);
    if (result.error) return res.status(400).json({ message: result.error });

    const exists = await ParkingSlot.findOne({ slotNumber: result.value.slotNumber });
    if (exists) return res.status(409).json({ message: 'Parking slot already exists' });

    const created = await ParkingSlot.create(result.value);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const result = validateSlot(req.body);
    if (result.error) return res.status(400).json({ message: result.error });

    const exists = await ParkingSlot.findOne({
      slotNumber: result.value.slotNumber,
      _id: { $ne: req.params.id },
    });
    if (exists) return res.status(409).json({ message: 'Parking slot already exists' });

    const updated = await ParkingSlot.findByIdAndUpdate(req.params.id, result.value, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Parking slot not found' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const deleted = await ParkingSlot.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Parking slot not found' });
    res.json({ message: 'Parking slot deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
