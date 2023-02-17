import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../db';

interface Game {
  title: string;
}

async function getGames() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM "Games"');
    return res.rows;
  } finally {
    client.release();
  }
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get the games from the database
      const games = await getGames();

      // Return the games as JSON
      res.status(200).json(games);
    } catch (error) {
      console.log('error', error);
      // Return a 500 status code to indicate an internal server error
      res.status(500).json({ message: 'Failed to get games', error });
    }
  } else if (req.method === 'POST') {
    try {
      // Get the game information from the request body
      const game = req.body;

      // Add the new game to the database
      await addGameToDatabase(game);

      // Return a 201 status code to indicate that the game was successfully created
      res.status(201).json({ message: 'Game created successfully' });
    } catch (error) {
      // Return a 500 status code to indicate an internal server error
      res.status(500).json({ message: 'Failed to create game', error });
    }
  } else {
    // Return a 405 status code to indicate that the method is not allowed
    res.status(405).json({ message: 'Method not allowed' });
  }
}

async function addGameToDatabase(game: Game) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO "Games" (title) VALUES ($1)',
      [game.title]
    );
  } finally {
    client.release();
  }
}