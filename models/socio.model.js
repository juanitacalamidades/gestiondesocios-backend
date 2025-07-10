
import mongoose from "mongoose";


const { Schema, model } = mongoose;


const socioSchema = new Schema({
    nombreEntidad : String,
    tipoSocio : [{
    type : String,
    enum : {
        values : ['Compañía', 'Distribuidora', 'Festival', 'Otro'],
        message : '{VALUE} no es un tipo de socio válido. Usa "Compañía", "Distribuidora", "Festival" u "Otro"'
    },
    required : [true, "El tipo de socio es obligatorio."]
   }],
   status : {
    type : String,
    enum : {
        values : ['interesado', 'ex-socio', 'activo'],
        message : '{VALUE} no es un estado válido. Usa "interesado", "ex-socio" o "activo"'
    },
    required : [true, "El status del socio es obligatorio."]
   },
   antiguedad : Number,
   provincia : {
    type : String,
    required : true
   },
   clave : Number,
   genero : String,
   contacto : {
    tlfnMovil : String,
    fijo : String,
    email1 : String,
    email2 : String
   },
   razonSocial : String,
   direccionFiscal : {
    calle : String,
    ciudad : String,
    provincia : String,
    codigoPostal : String
   },
   cuota : {
    pagada : Boolean,
    fechaDePago : Date,
    recibi : Boolean
   },
   activo :  Boolean,
   comision : {
    miembro1 : String,
    miembro2 : String,
    miembro3 : String
   },
   otros : {
    catalogo : Boolean,
    directorio : Boolean,
    videoFoto : Boolean,
    asamblea : {
        primera : Boolean,
        segunda : Boolean,
        tercera : Boolean
    }
   },
   notas : [{
    nota : String
   }]
});



// Añade índice único para el campo nombreEntidad con el fin de evitar duplicados en la base de datos, con case insesitive y en español.
socioSchema.index(
  { nombreEntidad: 1 },
  {
    unique: true,
    collation: { locale: 'es', strength: 2 }
  }
);



export const Socio = model("Socio", socioSchema);