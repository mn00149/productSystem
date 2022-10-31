import express from 'express';
import * as categoryRepository from '../models/Category.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const category = await categoryRepository.getAll()
  res.status(201).json(category);
});

router.post('/', async (req, res) => {
  res.status(201).send('Post: /category');
});

router.put('/:id', async (req, res) => {
  res.status(201).send('PUT: /category/:id');
});

router.delete('/:id', async (req, res) => {
  res.status(201).send('DELETE: /category/:id');
});

export default router;