import mongoose, { ConnectOptions } from "mongoose";
require('dotenv').config();

const dbUrl: string = process.env.DB_URL || '';

const connectDB = async () => {
  try {
    // console.log('Intentando conectar a la base de datos...');
    await mongoose.connect(dbUrl).then((data: any) => {
      console.log(`Base de datos conectada en ${data.connection.host}`);
    })
    
  } catch (error: any) {
    console.error('Error al conectar a la base de datos:', error.message || error);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
