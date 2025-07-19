// updateMembership.js
import dotenv from "dotenv";
dotenv.config(); // leer fichero .env y crear las variables de entorno
//--------------
import mongoose from 'mongoose';
import { Socio } from './models/socio.js';



// Script de backend que actualiza automáticamente el estado de cuota de los socios.
// Si la cuota fue pagada hace más de un año (cuota.pagada === true y fechaDePago > 1 año),
// se marca como no pagada (cuota.pagada = false).

// Este script está pensado para ejecutarse como una tarea programada (cron job),
// por ejemplo, diariamente desde Render.


async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    const today = new Date();

    // Encuentra socios con cuota pagada y fecha de pago definida
    const hasMembership = await Socio.find({
      'cuota.pagada': true,
      'cuota.fechaDePago': { $exists: true }
    });

    const membersUpdated = [];

    // Comprobar si la cuota ha caducado para cada socio
    for (const member of hasMembership) {
      const payDate = new Date(member.cuota.fechaDePago);
      const expireDate = new Date(payDate);
      expireDate.setFullYear(expireDate.getFullYear() + 1);

      if (today >= expireDate) {
        member.cuota.pagada = false;
        await member.save();
        membersUpdated.push(member.nombreEntidad);
      }
    }

    if (membersUpdated.length > 0) {
      console.log(`Se actualizaron las cuotas de los siguientes socios:`);
      membersUpdated.forEach(nombre => console.log(`- ${nombre}`));
    } else {
      console.log('No se encontró ninguna cuota vencida.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error en la actualización de cuotas:', error);
    process.exit(1);
  }
}

main();
