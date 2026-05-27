const express = require('express');
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const { authRequired } = require('../middleware/authRequired');

const router = express.Router();

function calcAmountRwf(entryTime, exitTime) {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);

  const diffMs = exit.getTime() - entry.getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return null;

  const hours = diffMs / (1000 * 60 * 60);
  const billHours = Math.max(1, Math.ceil(hours));
  const rate = 500;
  return billHours * rate;
}

async function validatePayment(body, currentId = null) {
  const parkingRecordId = String(body.parkingRecordId || '').trim();
  const paymentDateValue = body.paymentDate ? String(body.paymentDate).trim() : '';

  if (!parkingRecordId) {
    return { error: 'parkingRecordId is required' };
  }

  if (!paymentDateValue) {
    return { error: 'paymentDate is required' };
  }

  const record = await ParkingRecord.findById(parkingRecordId);
  if (!record) {
    return { error: 'Parking record not found' };
  }

  if (!record.exitTime) {
    return { error: 'exitTime is required to compute payment' };
  }

  const amountPaid = calcAmountRwf(record.entryTime, record.exitTime);
  if (amountPaid === null) {
    return { error: 'Invalid time range' };
  }

  const paymentDate = new Date(paymentDateValue);
  if (Number.isNaN(paymentDate.getTime())) {
    return { error: 'paymentDate must be a valid date' };
  }

  const existing = await Payment.findOne({
    parkingRecordId,
    _id: currentId ? { $ne: currentId } : { $exists: true },
  });
  if (existing) {
    return { error: 'Payment already exists for this record', status: 409 };
  }

  return { value: { parkingRecordId, amountPaid, paymentDate } };
}

router.get('/', authRequired, async (req, res) => {
  const payments = await Payment.find().sort({ paymentDate: -1 });
  res.json(payments);
});

router.get('/:id', authRequired, async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.json(payment);
});

router.post('/', authRequired, async (req, res) => {
  try {
    const result = await validatePayment(req.body);
    if (result.error) return res.status(result.status || 400).json({ message: result.error });

    const created = await Payment.create(result.value);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authRequired, async (req, res) => {
  try {
    const result = await validatePayment(req.body, req.params.id);
    if (result.error) return res.status(result.status || 400).json({ message: result.error });

    const updated = await Payment.findByIdAndUpdate(req.params.id, result.value, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Payment not found' });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
