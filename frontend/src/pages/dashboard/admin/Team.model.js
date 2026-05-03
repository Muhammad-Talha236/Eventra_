const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    role: { type: String }
  }],
  registration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
  status: {
    type: String,
    enum: ['forming', 'registered', 'cancelled'],
    default: 'forming'
  },
  totalFee: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);