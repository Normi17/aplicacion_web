import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified:boolean;
  properties: Array<{ propertiesId: string }>;
  comparePassword:(password: string) => Promise<boolean>;
  SingAccessToken: ()=>string;
  SignRefreshToken: ()=>string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, ingrese su nombre'],
    unique: true 
  },
  email: {
    type: String,
    required: [true, 'Por favor, ingrese su correo electrónico'],
    validate: {
      validator: function (value: string) {
        return emailRegex.test(value);
      },
      message: "Correo electrónico no válido",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Por favor, ingrese su contraseña'],
    minlength: [6, 'Ingrese al menos 6 caracteres'],
    select: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false ,
  },
  
  properties: [
    {
      propertiesId: String,
    },
  ],
}, { timestamps: true });

// Middleware para hashear la contraseña antes de guardar el usuario
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});
// sing Access
userSchema.methods.SingAccessToken=function () {
  return jwt.sign({id:this._id}, process.env.ACCESS_TOKEN || '');
  
}
//UPDATE TOKEN
userSchema.methods.SignRefreshToken=function () {
  return jwt.sign({id:this._id}, process.env.REFRESH_TOKEN || '');
  
}
// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

//

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
