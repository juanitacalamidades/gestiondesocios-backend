import dotenv from "dotenv"
dotenv.config();
//----------------
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getMembers, createMember, getMemberByName, getMemebersByType, getUnpaidFee, updateMember, createUser, getUser } from "./db/connect.js";


// Generar token para autenticación
function token(user){
    return jwt.sign( {user}, process.env.SECRET );
}; 

// Verificar usuario
function auth(request,response,next){
    let token = request.headers.authorization ? request.headers.authorization.split(" ")[1] : undefined;

    if(!token){
        return response.sendStatus(401); //does not exist
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

// Buscar por tipo de socio
server.post("/members/type", async (request, response) => {
    let {type} = request.body;

    try{
       
        let membersOf = await getMemebersByType(type);
        
        response.json(membersOf);
            
    }catch(error){
        response.status(500);
        response.json( { error : "error en el servidor" } )
    }
});

// Buscar socios con la cuota sin pagar
server.get("/members/unpaid", async (request, response) => {
    try{
        let unpaidMembership = await getUnpaidFee();

        response.json(unpaidMembership);

    }catch(error){
        response.status(500);
        response.json( { error : "error en el servidor" } )
    }
});

// Actualizar datos del socio
server.patch("/members/member/edit", async (request,response) => {
    let {id, updateData} = request.body;

    try{
        let newData = await updateMember(id, updateData);

        response.json(newData);

    }catch(error){
        response.status(500);
        response.json( { error : "error en el servidor" } )
    }
});

// Login
server.post("/login", async (request,response) => {
    let {name,password} = request.body;

    
    try{
        
        console.log(name)
        const possibleUser = await getUser(name);

        if(!possibleUser){
            return response.sendStatus(401); //unauthorized, el usuario no existe
        }
        
        let correct = await bcrypt.compare(password, possibleUser.password);

        if(!correct){
            return response.sendStatus(403); //forbidden, la contraseña es incorrecta
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
        let result = await bcrypt.hash(password, 10);
        // console.log(resultado);

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