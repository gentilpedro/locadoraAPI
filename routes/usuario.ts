import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { verificaToken } from '../middlewares/verificaToken';
import nodemailer from "nodemailer";

const prisma = new PrismaClient();
const router = Router();

const usuarioSchema = z.object({
    nome: z.string().min(10, {
        message: "Nome deve possuir, no mínimo, 10 caracteres",
    }),
    email: z.string().email().min(10, {
        message: "E-mail, no mínimo, 10 caracteres",
    }),
    senha: z.string(),
});

function validaSenha(senha: string): string[] {
    const mensagens: string[] = [];

    if (senha.length < 8) {
        mensagens.push("Erro... senha deve possuir, no mínimo, 8 caracteres");
    }

    let minusculas = 0;
    let maiusculas = 0;
    let numeros = 0;
    let simbolos = 0;

    for (const letra of senha) {
        if (/[a-z]/.test(letra)) minusculas++;
        else if (/[A-Z]/.test(letra)) maiusculas++;
        else if (/[0-9]/.test(letra)) numeros++;
        else simbolos++;
    }

    if (minusculas === 0) mensagens.push("Erro... senha deve possuir letra(s) minúscula(s)");
    if (maiusculas === 0) mensagens.push("Erro... senha deve possuir letra(s) maiúscula(s)");
    if (numeros === 0) mensagens.push("Erro... senha deve possuir número(s)");
    if (simbolos === 0) mensagens.push("Erro... senha deve possuir símbolo(s)");

    return mensagens;
}

// Listar usuários
router.get("/", async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar usuários", detalhes: error });
    }
});

// Criar novo usuário
router.post("/", async (req, res) => {
    const valida = usuarioSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error });
    }

    const { nome, email, senha } = valida.data;

    const errosSenha = validaSenha(senha);
    if (errosSenha.length > 0) {
        return res.status(400).json({ erro: errosSenha.join("; ") });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(senha, salt);

    try {
        const usuario = await prisma.usuario.create({
                data: { nome, email, senha: hash },
        });
        res.status(201).json(usuario);
    } catch (error) {
        res.status(400).json({ erro: "Erro ao criar usuário", detalhes: error });
    }
});

router.post('/solicitar-recuperacao', async (req, res) => {
    const { email } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    // Gera código 4 dígitos
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();

    // Atualiza usuário com código e validade (ex: 1 hora)
    const agora = new Date();
    const expiracao = new Date(agora.getTime() + 60 * 60 * 1000);

    await prisma.usuario.update({
        where: { email },
        data: {
            resetCode: codigo,
            resetExpires: expiracao,
        },
    });

    // Enviar e-mail (exemplo simples com nodemailer)
    const transporter = nodemailer.createTransport({
        // configure seu SMTP aqui
        host: 'smtp.seuservidor.com',
        port: 587,
        secure: false,
        auth: {
            user: 'seu-email@dominio.com',
            pass: 'sua-senha',
        },
    });

    await transporter.sendMail({
        from: '"Sistema" <no-reply@dominio.com>',
        to: process.env.EMAIL_USER,
        subject: 'Código de recuperação de senha',
        text: `Seu código para recuperação é: ${codigo}`,
    });

    res.json({ message: 'Código enviado para seu e-mail' });
});

router.post('/resetar-senha', async (req, res) => {
    const { email, codigo, novaSenha } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (!usuario.resetCode || !usuario.resetExpires) {
        return res.status(400).json({ error: 'Nenhum código de recuperação ativo' });
    }

    const agora = new Date();
    if (usuario.resetExpires < agora) {
        return res.status(400).json({ error: 'Senha alterada com sucesso' });
    }

    if (usuario.resetCode !== codigo) {
        return res.status(400).json({ error: 'Senha alterada com sucesso' });
    }

    // Criptografa a nova senha
    const hash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
        where: { email },
        data: {
            senha: hash,
            resetCode: null,
            resetExpires: null,
        },
    });

    res.json({ message: 'Senha alterada com sucesso' });
});

// Deletar usuário
router.delete("/:id", verificaToken, async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await prisma.usuario.delete({ where: { id } });
        res.status(200).json(usuario);
    } catch (error) {
        res.status(400).json({ erro: "Erro ao deletar usuário", detalhes: error });
    }
});

// Atualizar usuário
router.put("/:id", verificaToken, async (req, res) => {
    const { id } = req.params;

    const valida = usuarioSchema.safeParse(req.body);
    if (!valida.success) {
        return res.status(400).json({ erro: valida.error });
    }

    const { nome, email, senha } = valida.data;

    const errosSenha = validaSenha(senha);
    if (errosSenha.length > 0) {
        return res.status(400).json({ erro: errosSenha.join("; ") });
    }

    const salt = bcrypt.genSaltSync(12);
    const hash = bcrypt.hashSync(senha, salt);

    try {
        const usuario = await prisma.usuario.update({
            where: { id },
            data: { nome, email, senha: hash },
        });
        res.status(200).json(usuario);
    } catch (error) {
        res.status(400).json({ erro: "Erro ao atualizar usuário", detalhes: error });
    }
});

export default router;
