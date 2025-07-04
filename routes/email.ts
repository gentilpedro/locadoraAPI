import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/:clienteId', async (req, res) => {
  try {
    const clienteId = Number(req.params.clienteId);
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: { reservas: { include: { filme: true } } },
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const reservas = cliente.reservas
      .map((r) => `Reserva ID: ${r.id}, Filme: ${r.filme.titulo} ${r.filme.genero}, de ${r.dataInicio.toDateString()} até ${r.dataFim.toDateString()}`)
      .join('\n');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Relatório de Reservas',
      text: `Olá ${cliente.nome},\n\nSuas reservas:\n${reservas}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Email enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});


export default router;
