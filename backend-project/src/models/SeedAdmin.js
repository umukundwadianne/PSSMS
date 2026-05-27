const mongoose = require('mongoose')

const seedAdminSchema = new mongoose.Schema(
  {
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

module.exports = mongoose.model('SeedAdmin', seedAdminSchema)

