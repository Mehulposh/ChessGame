import  express from 'express';
import  http from 'http';
import  cors from 'cors';
import requestLogger from './middleware/requestLogger.js';
import errorHandler  from './middleware/errorHandler.js';
import roomRoutes    from './routes/gameRoute.js';
import initSocket    from './sockets/index.js';
import connectDB from './dbConfig/DbConnect.js';

// ── App setup ────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
 
// ── Database ─────────────────────────────────────────────────────
connectDB();
 
// ── Global middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(requestLogger);
 
// ── Routes ────────────────────────────────────────────────────────
app.use('/api', roomRoutes);
 
// ── Error handler (must come after routes) ────────────────────────
app.use(errorHandler);
 
// ── Socket.IO ────────────────────────────────────────────────────
initSocket(server);
 
// ── Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
 