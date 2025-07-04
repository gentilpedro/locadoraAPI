import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface do conteúdo esperado no token JWT
interface TokenInterface {
    userLogadoId: string;
    userLogadoNome: string;
}

// Estende a interface global do Express (para TypeScript)
declare global {
    namespace Express {
        interface Request {
            userLogadoId?: string;
            userLogadoNome?: string;
        }
    }
}

// Middleware para verificar o token JWT
export function verificaToken(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ erro: 'Token não informado' });
    }

    const token = authorization.split(' ')[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_KEY as string);
        const { userLogadoId, userLogadoNome } = decode as TokenInterface;

        req.userLogadoId = userLogadoId;
        req.userLogadoNome = userLogadoNome;

        next(); // Segue para o próximo middleware/rota
    } catch (erro) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
}
