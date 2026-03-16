import express from 'express';
const router = express.Router();
import {
    createRoom, 
    getRoom, 
    listGames,
    healthCheck
} from '../controller/gameController.js'
import asyncHandler from '../middleware/asyncHandler.js';

// Health
router.get('/health', healthCheck);

// Games list
router.get('/games', asyncHandler(listGames));
 
// Rooms
router.post('/rooms',           asyncHandler(createRoom));
router.get ('/rooms/:roomId',   getRoom);           // synchronous – no asyncHandler needed
 

export default  router;