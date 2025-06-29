import express from 'express';
import clienteRouter from './routes/cliente';
import veiculoRouter from './routes/filmes';
import reservaRouter from './routes/reserva';
import emailRouter from './routes/email';

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use('/clientes', clienteRouter);
app.use('/veiculos', veiculoRouter);
app.use('/reservas', reservaRouter);
app.use('/email', emailRouter);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
