import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '../generated/prisma'; 

interface AuthenticatedRequest extends Request {
  user?: { id: number; rol: string }; 
}

const ListadoUserController = (): Router => {
  const router = express.Router();

 
  // GET: Mostrar la lista de todos los usuarios 
  router.get("/", async (req: AuthenticatedRequest, resp: Response) => {
    const prisma = new PrismaClient(); 
    const userRole = req.user?.rol; 

    if (!userRole || userRole !== 'admin') {
      resp.status(403).json({ msg: "Acceso denegado: Se requiere rol de administrador." });
      return;
    }

    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          UsuarioID: true,
          Nombre: true,        
          Correo: true,    
          Alias: true, 
          Foto: true,     
        },
      });

      resp.json(usuarios); 

    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
      resp.status(500).json({ msg: "Error interno del servidor al obtener los usuarios." });
    } finally {
      await prisma.$disconnect(); // Desconecta Prisma al finalizar
    }
  });

  return router; 
};

export default ListadoUserController; 
