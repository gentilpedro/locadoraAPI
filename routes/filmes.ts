import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { titulo, genero, ano, disponivel } = req.body;
    const filme = await prisma.filme.create({
      data: {
        titulo,
        genero,
        ano,
        disponivel: disponivel ?? true,
      },
    });
    res.json(filme);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar filme' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filmes = await prisma.filme.findMany();
    res.json(filmes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar filmes' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.filme.delete({ where: { id } });
    res.json({ message: 'Filme excluído' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir filme' });
  }
});

export default router;
