import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const filme = await prisma.filme.create({ data: req.body });
  res.json(filme);
});

router.get('/', async (req, res) => {
  const filmes = await prisma.filme.findMany();
  res.json(filmes);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.filme.delete({ where: { id } });
  res.json({ message: 'Veículo excluído' });
});

export default router;
