import express from 'express';
import clienteRouter from './routes/cliente';
import filmesRouter from './routes/filmes';
import reservaRouter from './routes/reserva';
import emailRouter from './routes/email';
import segurancaRouter from './routes/seguranca';
import loginRouter from './routes/login';
import usuarioRouter from "./routes/usuario";

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use('/clientes', clienteRouter);
app.use('/filmes', filmesRouter);
app.use('/reservas', reservaRouter);
app.use('/email', emailRouter);
app.use('/seguranca', segurancaRouter);
app.use('/login', loginRouter);
app.use('/usuario', usuarioRouter);


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
