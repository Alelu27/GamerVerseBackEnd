import express, { Request, Response, Router, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';

interface AuthenticatedRequest extends Request {
  user?: { id: number; rol: string };
}

const NoticiasController = (): Router => {
  const router = express.Router();
  const prisma = new PrismaClient();

  const authenticateAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.rol;
    if (!userRole || userRole !== 'ADMIN') {
      res.status(403).json({ msg: "Acceso denegado: Se requiere rol de administrador." });
      return;
    }
    next();
  };

  // Obtener todas las noticias
  router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
      const noticias = await prisma.noticia.findMany({
        select: {
          NoticiaID: true,
          Titulo: true,
          Texto: true,
          Imagen: true,
        },
      });
      res.json(noticias);
    } catch (error) {
      console.error("Error al obtener las noticias:", error);
      res.status(500).json({ msg: "Error interno del servidor al obtener las noticias." });
    }
  });

  // Obtener una noticia por ID
  router.get("/:id", async (req: Request, res: Response): Promise<void> => {
    const noticiaID = parseInt(req.params.id);
    if (isNaN(noticiaID)) {
      res.status(400).json({ msg: "ID de noticia inválido." });
      return;
    }

    try {
      const noticia = await prisma.noticia.findUnique({
        where: { NoticiaID: noticiaID },
        select: {
          NoticiaID: true,
          Titulo: true,
          Texto: true,
          Imagen: true,
        },
      });

      if (!noticia) {
        res.status(404).json({ msg: "Noticia no encontrada." });
        return;
      }

      res.json(noticia);
    } catch (error) {
      console.error("Error al obtener la noticia:", error);
      res.status(500).json({ msg: "Error interno del servidor al obtener la noticia." });
    }
  });

  // Crear una nueva noticia
  router.post("/", authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { Titulo, Texto, imagen } = req.body;

    if (!Titulo || !Texto) {
      res.status(400).json({ msg: "Faltan campos obligatorios: Titulo, Texto." });
      return;
    }

    try {
      const nuevaNoticia = await prisma.noticia.create({
        data: {
          Titulo,
          Texto,
          Imagen: imagen || null,
          Activo: 1,
        },
      });
      res.status(201).json({ msg: "Noticia creada con éxito.", noticia: nuevaNoticia });
    } catch (error) {
      console.error("Error al crear la noticia:", error);
      res.status(500).json({ msg: "Error interno del servidor al crear la noticia." });
    }
  });

  // Actualizar una noticia existente
  router.put("/:id", authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const noticiaID = parseInt(req.params.id);
    const { Titulo, Texto, imagen } = req.body;

    if (isNaN(noticiaID)) {
      res.status(400).json({ msg: "ID de noticia inválido." });
      return;
    }

    if (!Titulo || !Texto) {
      res.status(400).json({ msg: "Faltan campos obligatorios: Titulo, Texto." });
      return;
    }

    try {
      const noticiaExistente = await prisma.noticia.findUnique({
        where: { NoticiaID: noticiaID },
      });

      if (!noticiaExistente) {
        res.status(404).json({ msg: "Noticia no encontrada." });
        return;
      }

      const noticiaActualizada = await prisma.noticia.update({
        where: { NoticiaID: noticiaID },
        data: {
          Titulo,
          Texto,
          Imagen: imagen || null,
        },
      });

      res.status(200).json({ msg: "Noticia actualizada con éxito.", noticia: noticiaActualizada });
    } catch (error) {
      console.error("Error al actualizar la noticia:", error);
      res.status(500).json({ msg: "Error interno del servidor al actualizar la noticia." });
    }
  });

  // Eliminar una noticia
  router.delete("/:id", authenticateAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const noticiaID = parseInt(req.params.id);

    if (isNaN(noticiaID)) {
      res.status(400).json({ msg: "ID de noticia inválido." });
      return;
    }

    try {
      const noticiaExistente = await prisma.noticia.findUnique({
        where: { NoticiaID: noticiaID },
      });

      if (!noticiaExistente) {
        res.status(404).json({ msg: "Noticia no encontrada." });
        return;
      }

      await prisma.noticia.delete({
        where: { NoticiaID: noticiaID },
      });

      res.status(200).json({ msg: "Noticia eliminada con éxito." });
    } catch (error) {
      console.error("Error al eliminar la noticia:", error);
      res.status(500).json({ msg: "Error interno del servidor al eliminar la noticia." });
    }
  });

  return router;
};

export default NoticiasController;
