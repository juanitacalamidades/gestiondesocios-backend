import dotenv from "dotenv";
dotenv.config(); // leer fichero .env y crear las variables de entorno
//--------------
import mongoose from "mongoose";
import { Socio } from "../models/socio.model.js";
import { User } from "../models/user.model.js"



let isConnected = false;

if(!isConnected){
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connection established");
}else{
    console.error("Error connecting to MongoDB", error.message);
}

// Función para escapar caracteres raros que puedan usarse en el nombre de la entidad
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Crear usuario
export async function createUser(userData){ //{user,password}
    try{
        const newUser = new User(userData);
        const result = await newUser.save();
        return result._id.toString();
    }catch(error){
        console.error("Error en la base de datos: " + error);
        throw error;
    }
}


//Buscar usuario
export async function getUser(userName){
    try{
        let userExists = await User.findOne({ name : userName })

        if(!userExists){
            throw { error : "no existe un usuario con este nombre"}
        }
        return userExists;
    }catch(error){
        console.error("Error en la base de datos: " + error);
        throw error;
    }
}


// Crear socio
export async function createMember(memberData){
    try{
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

        return result._id.toString();
    }catch(error){
        console.error( "Error en la base de datos: ", error);
        throw error;
    }
}

// Mostrar todos los socios
export async function getMembers(){
    try{
        const members = await Socio.find({});
        return members;
    }catch(error){
        console.error( "Error en la base de datos", error);
        throw error;
    }
};

// Buscar un socio por el id
export async function getMemberById(id) {
  try {
    // Validar que el ID sea un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("id no válido");
    }

    const member = await Socio.findById(id);
    return member;
  } catch (error) {
    console.error("Error en la base de datos: ", error);
    throw error;
  }
}

//Buscar socio por el nombre
export async function getMember(name){
    try{
        const member = await Socio.find({ nombreEntidad : { $regex: new RegExp(name, "i") }});
        return(member);
    }catch(error){
        console.error("Error en la base de datos: ", error);
        throw error;
    }
}


// Buscar socios por el tipo de socio (compañía, distribuidora,festival, otro)
export async function getMembersByType(memberType){
    try{
        const typeQuery = await Socio.where({ tipoSocio : new RegExp(`^${memberType}$`, "i"), status: { $nin: ["interesado", "ex-socio"] } }).find({});
        return typeQuery;
    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }
}


// Buscar socios que no han pagado la cuota
export async function getUnpaidFee(){
    try{
        const unpaid = await Socio.find( {'cuota.pagada' : false });
        return unpaid;
    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }
}

// Editar datos de un socio
export async function updateMember(id,updateData){
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
    }
}

export async function getInterested(){
     try{
        const interested = await Socio.find( {"status" : "interesado" });
        if(!interested){
            throw new Error("La lista de interesados está vacía")
        }
        return interested;
    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }
}

// Borrar socio
export async function deleteMember(id){
    try{
        let deletedCount = await Socio.deleteOne( {_id : id} );
        return deletedCount;
    }catch(error){
        console.error("Error en la base de datos ", error);
        throw error;
    }
}



