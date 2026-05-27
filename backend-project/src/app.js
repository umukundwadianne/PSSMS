const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const slotRoutes = require('./routes/parkingSlots');
const recordRoutes = require('./routes/parkingRecords');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// If frontend is on a different origin, set FRONTEND_ORIGIN in .env
const corsOrigin = process.env.FRONTEND_ORIGIN || false;
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret_change_me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set true when using HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Routes
app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/parking-slots', slotRoutes);
app.use('/api/parking-records', recordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

module.exports = app;

