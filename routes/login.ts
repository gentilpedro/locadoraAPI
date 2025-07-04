import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req, res) => {
    const { email, senha } = req.body;

    const mensagemPadrao = "Login ou senha incorretos";

    if (!email || !senha) {
        return res.status(400).json({ erro: mensagemPadrao });
    }

    try {
        const usuario = await prisma.usuario.findFirst({
            where: { email },
        });

        if (!usuario) {
            return res.status(400).json({ erro: mensagemPadrao });
        }

        const senhaValida = bcrypt.compareSync(senha, usuario.senha);

        if (senhaValida) {
            const token = jwt.sign(
                {
                    userLogadoId: usuario.id,
                    userLogadoNome: usuario.nome,
                },
                process.env.JWT_KEY as string,
                { expiresIn: "1h" }
            );

            return res.status(200).json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                token,
            });
        } else {
            // Registra tentativa com senha incorreta
            await prisma.log.create({
                data: {
                    usuarioId: usuario.id,
                    descricao: "Tentativa de acesso ao sistema",
                    complemento: `Usuário: ${usuario.id} - ${usuario.nome}`,
                },
            });

            return res.status(400).json({ erro: mensagemPadrao });
        }
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

export default router;
