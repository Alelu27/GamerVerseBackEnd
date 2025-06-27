import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '../generated/prisma';

interface AuthenticatedRequest extends Request {
  user?: { id: number }; 
}

const CarritoController = (): Router => {
  const router = express.Router();

  // GET: Todos los items del Carrito
  router.get("/", async (req: AuthenticatedRequest, resp: Response) => {
    const prisma = new PrismaClient(); 
    const usuarioID = req.user?.id; 

    if (usuarioID === undefined) {
      resp.status(401).json({ msg: "No autorizado: Usuario no identificado." });
      return;
    }

    try {
      const carritoItems = await prisma.carritoItem.findMany({
        where: { UsuarioID: usuarioID },
        include: {
          Juego: {
            select: {
              JuegoID: true,
              Nombre: true,
              Precio: true,
              Imagen: true,
            },
          },
        },
      });

      // Formatear la respuesta y calcular el subtotal
      const itemsFormateados = carritoItems.map(item => ({
        id: item.Juego.JuegoID, 
        nombre: item.Juego.Nombre,
        precio: parseFloat(item.Juego.Precio),
        cantidad: item.Cantidad,
        imagen: item.Juego.Imagen, 
      }));

      const subtotal = itemsFormateados.reduce((acc, item) => acc + (item.precio || 0) * item.cantidad, 0);

      resp.json({
        items: itemsFormateados,
        subtotal: parseFloat(subtotal.toFixed(2)),
      });

    } catch (error) {
      console.error("Error al obtener el carrito:", error);
      resp.status(500).json({ msg: "Error interno del servidor al obtener el carrito." });
    } finally {
      await prisma.$disconnect(); // Desconecta Prisma al finalizar la solicitud
    }
  });

  // POST: Agregar Item al carrito o se actualiza la cantidad
  router.post("/items", async (req: AuthenticatedRequest, resp: Response) => {
    const prisma = new PrismaClient();
    const usuarioID = req.user?.id;
    const { juegoId, cantidad } = req.body; 

    if (usuarioID === undefined) {
      resp.status(401).json({ msg: "No autorizado: Usuario no identificado." });
      return;
    }
    if (juegoId === undefined || typeof cantidad !== 'number' || cantidad < 1) {
      resp.status(400).json({ msg: "Debe enviar 'juegoId' (número) y 'cantidad' (número > 0)." });
      return;
    }

    try {
      const juegoExistente = await prisma.juego.findUnique({
        where: { JuegoID: juegoId },
      });
      if (!juegoExistente) {
        resp.status(404).json({ msg: "Juego no encontrado." });
        return;
      }

      const existingItem = await prisma.carritoItem.findUnique({
        where: {
          UsuarioID_JuegoID: { 
            UsuarioID: usuarioID,
            JuegoID: juegoId,
          },
        },
      });

      if (existingItem) {
        await prisma.carritoItem.update({
          where: { CarritoItemID: existingItem.CarritoItemID }, 
          data: { Cantidad: cantidad },
        });
      } else {
        await prisma.carritoItem.create({
          data: {
            UsuarioID: usuarioID,
            JuegoID: juegoId,
            Cantidad: cantidad,
          },
        });
      }

      const carritoActualizado = await prisma.carritoItem.findMany({
        where: { UsuarioID: usuarioID },
        include: { Juego: { 
          select: { JuegoID: true, Nombre: true, Precio: true, Imagen: true } 
          }  
        },
      });
      const itemsFormateados = carritoActualizado.map(item => ({
        id: item.Juego.JuegoID,
        nombre: item.Juego.Nombre,
        precio: parseFloat(item.Juego.Precio),
        cantidad: item.Cantidad,
        imagen: item.Juego.Imagen,
      }));

      resp.status(200).json({
        msg: "Ítem añadido/actualizado en el carrito con éxito.",
        items: itemsFormateados,
      });

    } catch (error) {
      console.error("Error al añadir/actualizar ítem en el carrito:", error);
      resp.status(500).json({ msg: "Error interno del servidor al añadir/actualizar ítem." });
    } finally {
      await prisma.$disconnect();
    }
  });

  // DELETE: Eliminar un Item del carrito
  router.delete("/items/:JuegoID", async (req: AuthenticatedRequest, resp: Response) => {
    const prisma = new PrismaClient();
    const usuarioID = req.user?.id;
    const juegoID = parseInt(req.params.JuegoID); 

    if (usuarioID === undefined) {
      resp.status(401).json({ msg: "No autorizado: Usuario no identificado." });
      return;
    }
    if (isNaN(juegoID)) {
      resp.status(400).json({ msg: "ID de juego inválido." });
      return;
    }

    try {
      const itemToDelete = await prisma.carritoItem.findUnique({
        where: {
          UsuarioID_JuegoID: {
            UsuarioID: usuarioID,
            JuegoID: juegoID,
          },
        },
      });

      if (!itemToDelete) {
        resp.status(404).json({ msg: "El juego no se encontró en el carrito de este usuario." });
        return;
      }

      await prisma.carritoItem.delete({
        where: { CarritoItemID: itemToDelete.CarritoItemID }, 
      });

      const carritoActualizado = await prisma.carritoItem.findMany({
        where: { UsuarioID: usuarioID },
        include: { Juego: { select:{ JuegoID: true, Nombre: true, Precio: true, Imagen: true } } },
      });
      const itemsFormateados = carritoActualizado.map(item => ({
        id: item.Juego.JuegoID,
        nombre: item.Juego.Nombre,
        precio: parseFloat(item.Juego.Precio),
        cantidad: item.Cantidad,
        imagen: item.Juego.Imagen,
      }));

      resp.status(200).json({
        msg: "Ítem eliminado del carrito con éxito.",
        items: itemsFormateados,
      });

    } catch (error) {
      console.error("Error al eliminar ítem del carrito:", error);
      resp.status(500).json({ msg: "Error interno del servidor al eliminar ítem." });
    } finally {
      await prisma.$disconnect();
    }
  });

  // DELETE: Vaciar el carrito
  router.delete("/", async (req: AuthenticatedRequest, resp: Response) => {
    const prisma = new PrismaClient();
    const usuarioID = req.user?.id;

    if (usuarioID === undefined) {
      resp.status(401).json({ msg: "No autorizado: Usuario no identificado." });
      return;
    }

    try {
      await prisma.carritoItem.deleteMany({
        where: { UsuarioID: usuarioID },
      });
      resp.status(200).json({ msg: "Carrito vaciado con éxito." });
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      resp.status(500).json({ msg: "Error interno del servidor al vaciar el carrito." });
    } finally {
      await prisma.$disconnect();
    }
  });

  return router;
};

export default CarritoController;