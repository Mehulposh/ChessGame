import Game from '../model/chessModel.js';

const getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 }).limit(20);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


const getGameByID = async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


const createGame = async (req, res) => {
  try {
    const { gameId } = req.body;
    const game = new Game({ gameId });
    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export {
    getAllGames,
    getGameByID,
    createGame
}