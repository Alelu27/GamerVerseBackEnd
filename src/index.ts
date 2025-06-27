import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import CarritoController from './controllers/CarritoController';
import NoticiasController from './controllers/NoticiaController';
import ListadoUserController from './controllers/ListadoUserController';

dotenv.config();

const app = express();
const rutaImagenes = path.join(process.cwd(), 'imagenes');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

function temporaryAuthMiddleware(req: any, res: any, next: any) {
  req.user = { id: 1, rol: 'ADMIN' };
  next();
}

app.use('/api/carrito', temporaryAuthMiddleware, CarritoController());
app.use('/noticias', temporaryAuthMiddleware, NoticiasController());
app.use('/listausers', temporaryAuthMiddleware, ListadoUserController());
app.use('/static', express.static(rutaImagenes));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
