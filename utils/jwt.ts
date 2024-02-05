require("dotenv").config();
import {Response} from "express";
import { IUser } from "../models/user.model";
import {redis} from "./redis";

interface ITokenOptions{
    expires:Date;
    maxAge: number;
    httpOnly:boolean;
    sameSite:'lax' | 'strict' |'none'| undefined;
    secure?:boolean;
}

export const sendToken = ( user:IUser, statusCode:number, res: Response)=> {
    const accesToken = user.SingAccessToken();
    const refreshToken  = user.SignRefreshToken();

    //sesion de redis
    redis.set(user._id, JSON.stringify(user) as any)
    //cambiar las variables del entornov virtual
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);


    //OPCIONES PARA LAS COCKIES
    const accessTokenOptions :ITokenOptions = {
        expires:new Date(Date.now()+ accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httpOnly:true,
        sameSite:"lax" ,//evita que el token se pueda leer desde un
    };
    const refreshTokenOptions :ITokenOptions = {
        expires:new Date(Date.now()+ refreshTokenExpire * 1000),
        maxAge: refreshTokenExpire * 1000,
        httpOnly:true,
        sameSite:"lax" ,//evita que el token se pueda leer desde un
    };

    if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
    }
    res.cookie("access_token", accesToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, accessTokenOptions);

    res.status(statusCode).json({
        success:true,
        user,
        accesToken,
    });
};