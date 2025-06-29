import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { clienteId, filmeId, dataInicio, dataFim, pagamento } = req.body;

  const filme = await prisma.filme.findUnique({ where: { id: filmeId } });
  if (!filme || !filme.disponivel) {
    return res.status(400).json({ error: 'Veículo não disponível' });
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

export default router;
