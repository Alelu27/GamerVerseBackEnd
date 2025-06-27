-- CreateTable
CREATE TABLE "Categoria" (
    "CategoriaID" SERIAL NOT NULL,
    "Nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("CategoriaID")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "UsuarioID" SERIAL NOT NULL,
    "Correo" VARCHAR(100) NOT NULL,
    "Password" VARCHAR(100) NOT NULL,
    "Nombre" VARCHAR(50) NOT NULL,
    "Token" VARCHAR(50) NOT NULL,
    "Estado" INTEGER NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("UsuarioID")
);

-- CreateTable
CREATE TABLE "Juego" (
    "JuegoID" SERIAL NOT NULL,
    "Nombre" VARCHAR(100) NOT NULL,
    "Precio" VARCHAR(100) NOT NULL,
    "Oferta" INTEGER NOT NULL,
    "Estado" INTEGER NOT NULL,
    "Categoria_CategoriaID" INTEGER NOT NULL,

    CONSTRAINT "Juego_pkey" PRIMARY KEY ("JuegoID")
);

-- CreateTable
CREATE TABLE "Plataforma" (
    "PlataformaID" SERIAL NOT NULL,
    "Nombre" VARCHAR(100) NOT NULL,

    CONSTRAINT "Plataforma_pkey" PRIMARY KEY ("PlataformaID")
);

-- CreateTable
CREATE TABLE "Calificacion" (
    "CalificacionID" INTEGER NOT NULL,
    "Usuario_UsuarioID" INTEGER NOT NULL,
    "Juego_JuegoID" INTEGER NOT NULL,
    "Juego_CategoriaID" INTEGER NOT NULL,
    "Valoracion" VARCHAR(100) NOT NULL,
    "Comentario" VARCHAR(1000) NOT NULL,

    CONSTRAINT "Calificacion_pkey" PRIMARY KEY ("CalificacionID","Usuario_UsuarioID","Juego_JuegoID","Juego_CategoriaID")
);

-- CreateTable
CREATE TABLE "Venta" (
    "VentaID" INTEGER NOT NULL,
    "Usuario_UsuarioID" INTEGER NOT NULL,
    "Juego_JuegoID" INTEGER NOT NULL,
    "Juego_CategoriaID" INTEGER NOT NULL,
    "Fecha" TIMESTAMP(3) NOT NULL,
    "Codigo" VARCHAR(30) NOT NULL,
    "MontoPagado" VARCHAR(100) NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("VentaID","Usuario_UsuarioID","Juego_JuegoID","Juego_CategoriaID")
);

-- CreateTable
CREATE TABLE "Noticia" (
    "NoticiaID" INTEGER NOT NULL,
    "Titulo" VARCHAR(100) NOT NULL,
    "Texto" VARCHAR(1000) NOT NULL,
    "Activo" INTEGER NOT NULL,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("NoticiaID")
);

-- CreateTable
CREATE TABLE "Juego_Plataforma" (
    "Plataforma_PlataformaID" INTEGER NOT NULL,
    "Juego_JuegoID" INTEGER NOT NULL,
    "Juego_Categoria_CategoriaID" INTEGER NOT NULL,

    CONSTRAINT "Juego_Plataforma_pkey" PRIMARY KEY ("Plataforma_PlataformaID","Juego_JuegoID","Juego_Categoria_CategoriaID")
);

-- CreateTable
CREATE TABLE "CarritoItem" (
    "CarritoItemID" SERIAL NOT NULL,
    "UsuarioID" INTEGER NOT NULL,
    "JuegoID" INTEGER NOT NULL,
    "Cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CarritoItem_pkey" PRIMARY KEY ("CarritoItemID"),
    CONSTRAINT "CarritoItem_UsuarioID_JuegoID_key" UNIQUE ("UsuarioID", "JuegoID"),

    CONSTRAINT "CarritoItem_UsuarioID_fkey" FOREIGN KEY ("UsuarioID") REFERENCES "Usuario"("UsuarioID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarritoItem_JuegoID_fkey" FOREIGN KEY ("JuegoID") REFERENCES "Juego"("JuegoID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_UsuarioID_key" ON "Usuario"("UsuarioID");

-- CreateIndex
CREATE UNIQUE INDEX "Calificacion_Usuario_UsuarioID_key" ON "Calificacion"("Usuario_UsuarioID");

-- AddForeignKey
ALTER TABLE "Juego" ADD CONSTRAINT "Juego_Categoria_CategoriaID_fkey" FOREIGN KEY ("Categoria_CategoriaID") REFERENCES "Categoria"("CategoriaID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_Usuario_UsuarioID_fkey" FOREIGN KEY ("Usuario_UsuarioID") REFERENCES "Usuario"("UsuarioID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calificacion" ADD CONSTRAINT "Calificacion_Juego_JuegoID_fkey" FOREIGN KEY ("Juego_JuegoID") REFERENCES "Juego"("JuegoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_Usuario_UsuarioID_fkey" FOREIGN KEY ("Usuario_UsuarioID") REFERENCES "Usuario"("UsuarioID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_Juego_JuegoID_fkey" FOREIGN KEY ("Juego_JuegoID") REFERENCES "Juego"("JuegoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Juego_Plataforma" ADD CONSTRAINT "Juego_Plataforma_Plataforma_PlataformaID_fkey" FOREIGN KEY ("Plataforma_PlataformaID") REFERENCES "Plataforma"("PlataformaID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Juego_Plataforma" ADD CONSTRAINT "Juego_Plataforma_Juego_JuegoID_fkey" FOREIGN KEY ("Juego_JuegoID") REFERENCES "Juego"("JuegoID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddColumn faltaba imagen 
ALTER TABLE "Noticia" ADD COLUMN "Imagen" VARCHAR(255);

-- AddColumn faltaba imagen 
ALTER TABLE "Juego" ADD COLUMN "Imagen" VARCHAR(255);

-- AddColumn faltaba imagen 
ALTER TABLE "CarritoItem" ADD COLUMN "Imagen" VARCHAR(255);

-- AddColum Foto y Alias en User
ALTER TABLE "Usuario" ADD COLUMN "Alias" VARCHAR(255); 
ALTER TABLE "Usuario" ADD COLUMN "Foto" VARCHAR(255);  