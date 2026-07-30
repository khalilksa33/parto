require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parto', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Parto MongoDB Connected Successfully'))
.catch(err => console.error('Parto MongoDB Connection Error: ', err));

// Import Routes
const tenantRoutes = require('./routes/tenantRoutes');

// Mount Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Parto Backend is running smoothly.' });
});
app.use('/api/tenants', tenantRoutes);

app.listen(PORT, () => {
  console.log(`Parto Backend running on port ${PORT}`);
});
