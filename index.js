import dotenv from "dotenv"
dotenv.config();
//----------------
import express from "express";
import cors from "cors";

const server = express();

server.use(cors());
server.use(express.json());

// Rutas

// Login 

//  Ver todos los socios GET /socios
//  Crear socio POST /socios/nuevo
//  Borrar socio DELETE /socios/borrar/:id
//  Editar socio 



// Middlewate especial para responder a errores. Recibe los 4 parámetros en la callback; es un middleware de gestión TOTAL de errores, es decir, cualqeuir error en cualquier otro middleware, caerá aquí
server.use((error,request,response,next) => { 
    respuesta.status(400);
    respuesta.send("Error en la petición");
});

// Error 404: si no entra en ninguna de las anteriores, cae en el 404
server.use((request,response) => {
    respuesta.status(404);
    respuesta.json({ error : "Recurso no encontrado." });
})

server.listen(4000);