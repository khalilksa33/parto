const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tenant', tenantSchema);
