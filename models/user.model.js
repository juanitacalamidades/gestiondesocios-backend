
import mongoose from "mongoose";


const { Schema, model } = mongoose;

const userSchema = new Schema({
    name : String,
    password : {
        type : String,
        requiered : true
    }
});

userSchema.index(
  { name: 1 },
  {
    unique: true
  }
);

export const User = model('User', userSchema);