import dotenv from "dotenv";
dotenv.config(); // leer fichero .env y crear las variables de entorno
//--------------
import mongoose from "mongoose";
import { Socio } from "../models/socio.model.js";
import { User } from "../models/user.model.js"



let isConnected = false;

async function conectar(){
    if(!isConnected){
        try{
            await mongoose.connect(process.env.MONGO_URI);
            console.log("Connection established");
        }catch(error){
            console.error("Error connecting to MongoDB", error.message);
        }
    }
}    

// Función para escapar caracteres raros que puedan usarse en el nombre de la entidad
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Crear usuario
export async function createUser(userData){ //{user,password}

   
    try{
        await conectar();
        console.log(userData)

        const newUser = new User(userData);
        const result = await newUser.save();

        return result._id.toString();


    }catch(error){
        console.error("Error en la base de datos: " + error);
        throw error;
    }finally{
        await mongoose.connection.close()
    }
}


//Buscar usuario
export async function getUser(userName){

    try{
        await conectar();

        let userExists = await User.findOne({ name : userName })

        if(!userExists){
            throw { error : "no existe un usuario con este nombre"}
        }

        return userExists;



    }catch(error){
        console.error("Error en la base de datos: " + error);
        throw error;
    }finally{
        await mongoose.connection.close()
    }
}




// Crear socio
export async function createMember(memberData){
    
    try{
        await conectar();
        
        // el nombre de la entidad se convierte a minúscula antes de guardarlo
        memberData.nombreEntidad = memberData.nombreEntidad.trim().toLowerCase();

        // Comprobar que el socio no está dado de alta en el sistema, insensible a mayúsculas
        const checkMember = await Socio.findOne({ nombreEntidad : new RegExp(`^${escapeRegex(memberData.nombreEntidad)}$`, 'i') })

        if(checkMember) {
            throw { error : "Ya existe un socio con el mismo nombre de entidad" }
        }

        // Crear instancia del modelo Socio
        const newMember = new Socio(memberData);
        const result = await newMember.save();

       // console.log("socio creado: ", result._id);


        return result._id.toString();
    }catch(error){
        console.error( "Error en la base de datos: ", error);
        throw error;

    }finally{
        await mongoose.connection.close();
    }
}

// Mostrar todos los socios
export async function getMembers(){
   
    await conectar();

    try{
        const members = await Socio.find({});
        return members;
    }catch(error){
        console.error( "Error en la base de datos", error);
        throw error;
    }finally{
        await mongoose.connection.close();
    }
  
};

// Buscar un socio por el nombre de entidad
export async function getMemberByName(name){
    
    await conectar();

    try{
        // usar RegExp para evitar la necesidad de búsqueda exacta
        const nameQuery = Socio.where({ nombreEntidad : new RegExp(name, "i") });
        
        const entidad = await nameQuery.findOne();

        return entidad; // devuelve todo el objeto

    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }finally{
        await mongoose.connection.close();
    }

}

// Buscar socios por el tipo de socio (compañía, distribuidora,festival, otro)
export async function getMemebersByType(memberType){
    await conectar();

    try{

        const typeQuery = await Socio.where({ tipoSocio : memberType }).find({});
        return typeQuery;

    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }finally{
        await mongoose.connection.close();
    }
}


// Buscar socios que no han pagado la cuota
export async function getUnpaidFee(){
    await conectar();

    try{

        const unpaid = await Socio.find( {'cuota.pagada' : false }).select('nombreEntidad tipoSocio')

        return unpaid;

    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }finally{
        await mongoose.connection.close();
    }
}

// Editar datos de un socio
export async function updateMember(id,updateData){
    await conectar();

    try{

        const updated = await Socio.findByIdAndUpdate(id, updateData, {
            new : true, // retornar el documento actualizado
            runValidators : true, //forzar las validaciones
            collation : { locale : 'es', strength : 2} // definir cómo se comparan los strings: en espaol, case insensitive
        });

        if(!updated){
            throw new Error("Socio no encontrado")
        }

        return updated;

    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }finally{
        await mongoose.connection.close();
    }
}

// Borrar socio
export async function deleteMember(id){
    await conectar();

    try{

        let deletedCount = await Socio.deleteOne( {_id : id} );

        return deletedCount;

    }catch(error){

    }finally{
        await mongoose.connection.close();
    }
}


// Script para cambiar todos los nombreEntidad a minúscula
export async function insensitiveNombreEntidad(){
    try{
        await conectar();
        await Socio.updateMany({}, [ { $set: { nombreEntidad: { $toLower: "$nombreEntidad" } } } ]);
    }catch(error){
        console.error(error)
    }finally{
        await mongoose.connection.close();
    }
}
