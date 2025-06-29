# 🛠️ Locadora Avenida - Backend (Node.js + Express + Prisma)

Este é o backend da aplicação **Locadora Avenida**, responsável pela manipulação dos dados de filmes, clientes, reservas e pagamentos, com conexão ao banco de dados **MySQL** usando **Prisma ORM**.

---

## 🔧 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)
- [Nodemailer](https://nodemailer.com/) (para envio de emails)

---

---

## 🗃️ Modelos no Prisma

```prisma
model Cliente {
  id       Int       @id @default(autoincrement())
  nome     String
  email    String
  telefone String
  reservas Reserva[]
}

model Filme {
  id         Int       @id @default(autoincrement())
  Titulo     String
  Genero     String
  ano        Int
  disponivel Boolean   @default(true)
  reservas   Reserva[]
}

model Reserva {
  id         Int        @id @default(autoincrement())
  dataInicio DateTime
  dataFim    DateTime
  clienteId  Int
  filmeId    Int
  pagamento  Pagamento?

  cliente Cliente @relation(fields: [clienteId], references: [id])
  filme   Filme   @relation(fields: [filmeId], references: [id])
}

model Pagamento {
  id        Int    @id @default(autoincrement())
  valor     Float
  metodo    String
  reservaId Int    @unique

  reserva Reserva @relation(fields: [reservaId], references: [id])
}
```
## ⚙️ Como Executar o Backend

1. Clonar o repositório e instalar as dependências

```bash
npm install
```
