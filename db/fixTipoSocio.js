// fixTipoSocio.js

// 📌 Qué hace:
// Encuentra documentos donde tipoSocio es un array.

// Toma el primer valor si es un string válido.

// Lo guarda como string.

// Ignora casos problemáticos y los deja logueados.


import dotenv from "dotenv";
dotenv.config(); // Para usar variables de entorno si las necesitas
import mongoose from "mongoose";

let isConnected = false;

if(!isConnected){
    mongoose.connect("mongodb+srv://yoannarrd:rLTxVfmO1DdTYbYJ@cluster-prueba.os6y8qr.mongodb.net/socios-artekale");
    console.log("Connection established");
}else{
    console.error("Error connecting to MongoDB", error.message);
}

// Define un esquema mínimo solo para esta operación
const socioSchema = new mongoose.Schema({
  tipoSocio: mongoose.Schema.Types.Mixed
}, { strict: false }); // Permite campos adicionales

const Socio = mongoose.model("Socio", socioSchema);

try {
  const sociosConArray = await Socio.find({ tipoSocio: { $type: "array" } });

  console.log(`Encontrados ${sociosConArray.length} documentos con tipoSocio como array.`);

  for (const socio of sociosConArray) {
    const [primero] = socio.tipoSocio;
    if (typeof primero === "string") {
      socio.tipoSocio = primero;
      await socio.save();
      console.log(`✅ Actualizado: ${socio._id}`);
    } else {
      console.warn(`⚠️ tipoSocio no contiene string en ${socio._id}`);
    }
  }

  console.log("🧹 Limpieza completada.");

} catch (error) {
  console.error("❌ Error al limpiar tipoSocio:", error);
} finally {
  await mongoose.connection.close();
}
