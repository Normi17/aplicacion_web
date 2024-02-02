import  {app } from './app';
import connectDB  from './utils/db';
require("dotenv").config();

// Agregado: iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`servidor escuchando: ${process.env.PORT}`);
  connectDB();

});
