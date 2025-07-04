import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';

const prisma = new PrismaClient();
const router = Router();

router.get('/backup', async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        const logs = await prisma.log.findMany();
        const clientes = await prisma.cliente.findMany();
        const filmes = await prisma.filme.findMany();
        const reservas = await prisma.reserva.findMany();
        const pagamentos = await prisma.pagamento.findMany();

        const dadosBackup = {
            usuarios,
            logs,
            clientes,
            filmes,
            reservas,
            pagamentos,
            dataBackup: new Date().toISOString(),
        };

        const caminho = path.resolve(__dirname, '../../backup.json');
        fs.writeFileSync(caminho, JSON.stringify(dadosBackup, null, 2));

        res.json({ mensagem: 'Backup gerado com sucesso!', arquivo: 'backup.json' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao gerar o backup.' });
    }
});

router.post('/restore', async (req, res) => {
    try {
        const caminho = path.resolve(__dirname, '../../backup.json');
        if (!fs.existsSync(caminho)) {
            return res.status(404).json({ erro: 'Arquivo de backup.json não encontrado.' });
        }

        const conteudo = fs.readFileSync(caminho, 'utf8');
        const dados = JSON.parse(conteudo);

        // 1. Deletar dados em ordem reversa das FKs
        await prisma.pagamento.deleteMany();
        await prisma.reserva.deleteMany();
        await prisma.cliente.deleteMany();
        await prisma.filme.deleteMany();
        await prisma.log.deleteMany();
        await prisma.usuario.deleteMany();

        // 2. Restaurar dados na ordem correta
        for (const usuario of dados.usuarios) {
            await prisma.usuario.create({ data: usuario });
        }

        for (const cliente of dados.clientes) {
            await prisma.cliente.create({ data: cliente });
        }

        for (const filme of dados.filmes) {
            await prisma.filme.create({ data: filme });
        }

        for (const reserva of dados.reservas) {
            await prisma.reserva.create({ data: reserva });
        }

        for (const pagamento of dados.pagamentos) {
            await prisma.pagamento.create({ data: pagamento });
        }

        for (const log of dados.logs) {
            await prisma.log.create({ data: log });
        }

        res.json({ mensagem: 'Dados restaurados com sucesso a partir do backup.' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao restaurar os dados.' });
    }
});

export default router;
