require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this for production
    methods: ['GET', 'POST', 'PUT']
  }
});

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
const notificationRoutes = require('./routes/notificationRoutes');

// Mount Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Parto Backend is running smoothly.' });
});
app.use('/api/tenants', tenantRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
  
  socket.on('leave', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Pass IO instance to routes/controllers if needed globally
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Parto Backend (with Socket.io) running on port ${PORT}`);
});
