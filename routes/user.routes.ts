import express from "express";
import { registrationUser, activateUser } from "../controllers/user.controller"; // Asegúrate de importar activateUser
const userRoute = express.Router();

userRoute.post('/registrar', registrationUser);
userRoute.post('/activarUser', activateUser); // Agrega la ruta para activar el usuario
export default userRoute;
