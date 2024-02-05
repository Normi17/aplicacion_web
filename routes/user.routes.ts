import express from "express";
import { registrationUser, activateUser, loginUser, logoutUser  } from "../controllers/user.controller";
import { isAuthentificated } from "../middleware/auth";

const userRoute = express.Router();

// Rutas para el registro, activación y inicio de sesión de usuarios
userRoute.post('/register', registrationUser); 
userRoute.post('/activate', activateUser);     
userRoute.post('/login', loginUser);
userRoute.get('/logout', isAuthentificated, logoutUser);
 


export default userRoute;
