import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const MidleWare = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Error interno del servidor';

    // Cuando el id de MongoDB es erróneo
    if (err.name === 'CastError') {
        const message = `Recurso no encontrado: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    if (err.code === 11000) {
        const message = `Clave duplicada: ${Object.keys(err.keyValue)}`;
        err = new ErrorHandler(message, 400);
    }

    // Error en token JWT
    if (err.name === 'JsonWebTokenError') {
        const message = `Error en el token JWT: ${err.message}`;
        err = new ErrorHandler(message, 400);
    }

    // Token expirado
    if (err.name === 'TokenExpiredError') {
        
        const message = 'Token expirado, intente de nuevo';
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
