const express = require('express');
const Car = require('../models/Car');
const { authRequired } = require('../middleware/authRequired');

const router = express.Router();

function validateCar(body) {
  const plateNumber = String(body.plateNumber || '').trim().toUpperCase();

  // Driver name: allow ONLY letters + spaces + common separators, and disallow numbers.
  // Examples allowed: "John", "Mary Jane", "O'Neil", "Jean-Pierre"
  let driverName = String(body.driverName || '').trim();
  driverName = driverName.replace(/\s+/g, ' ');

  const phoneNumber = String(body.phoneNumber || '').trim();

  if (!plateNumber || !driverName || !phoneNumber) {
    return { error: 'plateNumber, driverName, phoneNumber are required' };
  }

  if (plateNumber.length < 3) {
    return { error: 'plateNumber must be at least 3 characters' };
  }

  if (driverName.length < 2) {
    return { error: 'driverName must be at least 2 characters' };
  }

  // No digits anywhere in driverName.
  if (/[0-9]/.test(driverName)) {
    return { error: 'driverName must not contain numbers' };
  }

  // Only alphabets and spaces (no signs / punctuation / numbers).
  if (!/^[\p{L}\s]+$/u.test(driverName)) {
    return { error: 'driverName must contain only alphabets' };
  }


  if (!/^[0-9+\-\s()]{7,20}$/.test(phoneNumber)) {
    return { error: 'phoneNumber must be a valid phone number' };
  }

  return { value: { plateNumber, driverName, phoneNumber } };
}

router.get('/', authRequired, async (req, res) => {
  const cars = await Car.find().sort({ createdAt: -1 });
  res.json(cars);
});

router.get('/:id', authRequired, async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ message: 'Car not found' });
  res.json(car);
});

router.post('/', authRequired, async (req, res) => {
  try {
    const result = validateCar(req.body);
    if (result.error) return res.status(400).json({ message: result.error });

    const exists = await Car.findOne({ plateNumber: result.value.plateNumber });
    if (exists) return res.status(409).json({ message: 'Car already exists' });

    const created = await Car.create(result.value);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const result = validateCar(req.body);
    if (result.error) return res.status(400).json({ message: result.error });

    const exists = await Car.findOne({
      plateNumber: result.value.plateNumber,
      _id: { $ne: req.params.id },
    });
    if (exists) return res.status(409).json({ message: 'Car already exists' });

    const updated = await Car.findByIdAndUpdate(req.params.id, result.value, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Car not found' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const deleted = await Car.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Car deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
