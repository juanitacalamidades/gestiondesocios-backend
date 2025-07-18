import dotenv from "dotenv"
dotenv.config();
//----------------
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getMembers, createMember, getMemberById, getMembersByType, getUnpaidFee, updateMember, createUser, getUser, getInterested, getMember } from "./db/connect.js";


// Generar token para autenticación
function token(user){
    return jwt.sign( {user}, process.env.SECRET );
}; 

// Verificar usuario
function auth(request,response,next){

    // Convierte la info en headers en array y extrae el token, en el índice 1
    let token = request.headers.authorization ? request.headers.authorization.split(" ")[1] : undefined;

    if(!token){
        return response.sendStatus(401).json({ error : "usuario no autorizado" }); //unauthorized
    }

    jwt.verify(token, process.env.SECRET, (error, data) => {
        if(!error){
            request.user = data.user;
            return next();
        }
        response.sendStatus(403); // forbidden
    })
}



const server = express();

server.use(cors());
server.use(express.json());

server.use("/pruebas", express.static("./pruebas"));


// Mostrar todos los socios o filtrar por tipo
server.get("/members", auth, async (request,response) => {
    let {type,unpaid} = request.query;
    try{
        let members;
        if(unpaid === "true"){
            // Si unpaid es true, devolver solo los que no han pagado la cuota
            members = await getUnpaidFee();
        }else if(type){
             // Si se especifica un tipo de socio
            members = await getMembersByType(type);
        }else{
            // Sin filtro
            members =  await getMembers();
        }
        response.json(members);
    }catch(error){
        response.status(500);
        response.json({ error : "error en el servidor" });
    }
});

// Crear nuevo socio
server.put("/members/new", auth, async (request,response) => {
    let data = request.body;
    try {
        let newMember = data;
        let id = await createMember(newMember);
        response.status(201);
        response.json({id})
    }catch(error){
        response.status(500);
        response.json({ error : "error en el servidor" });
    }
});

// Buscar socio por nombre
server.get("/members/member", auth, async (request,response) => {
    let name = request.query.name;

    if(!name){
        return response.status(400).json( { error : "falta el parámetro nombre" } );
    }
    try{
        let member = await getMember(name);
        response.json(member);
    }catch(error){
        response.status(500);
        response.json({ error : "error en el servidor" })
    }


});

// Buscar socio por id 
server.get("/members/member/:id", auth, async (request, response) => {
    let {id} = request.params;
    try{
        let member = await getMemberById(id);
        if(!member){
            return response.status(404).json( { error : "no existe un socio con este nombre" } );
        }
        response.json(member);
    }catch(error){
        response.status(500);
        response.json({ error : "error en el servidor" })
    }
});


// Actualizar datos del socio
server.patch("/members/member/edit", auth, async (request,response) => {
    let {id, updateData} = request.body;
    try{
        let newData = await updateMember(id, updateData);
        response.json(newData);
    }catch(error){
        response.status(500);
        response.json({ error : "error en el servidor" })
    }
});


server.get("/interested", auth, async (request,response) => {
    try{
        let interested = await getInterested();
        response.json(interested)
    }catch(error){
        response.sendStatus(500);
        response.json({ error : "Error en el servidor" })
    }
})


// Login
server.post("/login", async (request,response) => {
    let {name,password} = request.body;
    try{
        const possibleUser = await getUser(name);
        if(!possibleUser){
            return response.sendStatus(401).json( { error : "no autorizado" }); //unauthorized, el usuario no existe
        }      
        let correct = await bcrypt.compare(password, possibleUser.password);
        if(!correct){
            return response.sendStatus(403).json( { error : "datos de acceso incorrectos" } ); //forbidden, la contraseña es incorrecta
        }
        response.json( { token : token(name) } )
    }catch(error){
        console.error("error en /login: ", error)
        response.status(500).json({ error : "error en el servidor"});
    }
});

// Crear usuario
server.post("/register", async (request,response) => {
    let {name,password} = request.body;
    try{
        let result = await bcrypt.hash(password, 10); // Encripta la contraseña
        await createUser({name, password : result });
        response.send("usuario registrado")
    }catch(error){
        response.status(500);
        response.json({error : "error en el servidor"});
    }
});




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