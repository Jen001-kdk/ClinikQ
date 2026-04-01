const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] }
});

app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Mount Routes
app.use('/api', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin')(io));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api', require('./routes/patient'));
app.use('/api', require('./routes/queue')(io));

server.listen(5001, () => console.log("🚀 Backend Server is running on Port 5001"));