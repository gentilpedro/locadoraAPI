import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const cliente = await prisma.cliente.create({ data: req.body });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar cliente' });
  }
});

router.get('/', async (req, res) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const cliente = await prisma.cliente.findUnique({ where: { id } });

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  res.json(cliente);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nome, email, telefone } = req.body;

  try {
    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: { nome, email, telefone },
    });

    res.json(clienteAtualizado);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar cliente' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.cliente.delete({ where: { id } });
    res.json({ message: 'Cliente excluído' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir cliente' });
  }
});

export default router;
