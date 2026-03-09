import express from 'express';
const router = express.Router();
import {
    getAllGames,
    getGameByID,
    createGame
} from '../controller/gameController.js'

// Get all games
router.get('/', getAllGames);

// Get specific game
router.get('/:gameId', getGameByID );

// Create new game
router.post('/', createGame);

export default  router;