const mongoose = require('mongoose')

// Used for password recovery tokens (hash stored, raw token returned to client only in dev mode)
const passwordResetTokenSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema)

