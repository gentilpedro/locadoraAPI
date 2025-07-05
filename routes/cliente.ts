import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import {verificaToken} from "../middlewares/verificaToken";

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
router.delete('/:id', verificaToken, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  try {
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    if (cliente.deleted) {
      return res.status(400).json({ error: 'Cliente já excluído' });
    }
    await prisma.cliente.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    await prisma.log.create({
      data: {
        descricao: 'DELETE (soft)',
        complemento: `Cliente ID: ${id}`,
        usuarioId: req.userLogadoId || '0',
        createdAt: new Date(),
        updatedAt: new Date(),
        id: undefined,
      }
    });
    res.json({ message: 'Cliente excluído (soft delete) com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno ao excluir cliente' });
  }
});


export default router;
