import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { clienteId, filmeId, dataInicio, dataFim, pagamento } = req.body;

  const filme = await prisma.filme.findUnique({ where: { id: filmeId } });
  if (!filme || !filme.disponivel) {
    return res.status(400).json({ error: 'Filme não disponível' });
  }

  const reserva = await prisma.$transaction(async (tx) => {
    const novaReserva = await tx.reserva.create({
      data: {
        clienteId,
        filmeId,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      },
    });

    await tx.pagamento.create({
      data: {
        reservaId: novaReserva.id,
        valor: pagamento.valor,
        metodo: pagamento.metodo,
      },
    });

    await tx.filme.update({
      where: { id: filmeId },
      data: { disponivel: false },
    });

    return novaReserva;
  });

  res.json(reserva);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const reserva = await prisma.reserva.findUnique({ where: { id } });
  if (!reserva) {
    return res.status(404).json({ error: 'Reserva não encontrada' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.pagamento.deleteMany({ where: { reservaId: id } });
    await tx.reserva.delete({ where: { id } });
    await tx.filme.update({
      where: { id: reserva.filmeId },
      data: { disponivel: true },
    });
  });

  res.json({ message: 'Reserva excluída com sucesso' });
});
router.get('/', async (req, res) => {
  try {
    const reserva = await prisma.reserva.findMany();
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar reservas' });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        cliente: true,    // caso queira dados do cliente
        filme: true,      // caso queira dados do filme
        pagamento: true,  // para trazer os dados do pagamento relacionado
      },
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar reserva' });
  }
});

export default router;
