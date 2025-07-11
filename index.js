import dotenv from "dotenv"
dotenv.config();
//----------------
import express from "express";
import cors from "cors";
import { getMembers, createMember, getMemberByName, getMemebersByType } from "./db/connect.js";



const server = express();

server.use(cors());
server.use(express.json());

server.use("/pruebas", express.static("./pruebas"));


// Mostrar todos los socios
server.get("/members", async (request,response) => {

    try{

        let members = await getMembers();

        response.json(members);

    }catch(error){
        response.status(500);
        response.json( { error : "error en el servidor" } );
    }

});

// Crear nuevo socio
server.put("/members/new", async (request,response) => {

    let data = request.body;
    console.log(data)
    try {
        let newMember = data;
        let id = await createMember(newMember);

        response.status(201);
        response.json({id})

    }catch(error){
        response.status(500);
        response.json( { error : "error en el servidor" } );
    }
});

// Buscar socio por nombre
server.post("/members/member/:name", async (request, response) => {
    let {name} = request.params;
    try{
        console.log(name);

        let member = await getMemberByName(name);

        if(!member){
            return response.send( { error : "No existe un socio con este nombre" } );
        }

        response.json(member);

    }catch(error){
        response.status(500);
        response.json( { error : "error en el servidor" } )
    }
});

// server.post("socios/socio/tipo")







// Middlewate especial para responder a errores. Recibe los 4 parámetros en la callback; es un middleware de gestión TOTAL de errores, es decir, cualqeuir error en cualquier otro middleware caerá aquí
server.use((error,request,response,next) => { 
    response.status(400);
    response.send("Error en la petición");
});

// Error 404: si no entra en ninguna de las anteriores, cae en el 404
server.use((request,response) => {
    response.status(404);
    response.json({ error : "Recurso no encontrado." });
})

server.listen(4000);