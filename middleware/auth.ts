

import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/ErrorHandler';
import { catchAsyncError } from '../utils/catchAsyncError';
import jwt, {JwtPayload} from 'jsonwebtoken';
import { redis } from '../utils/redis';



// Middleware de autenticación
export const isAuthentificated = catchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      const access_token = req.cookies.access_token as string;
      if (!access_token) {
        return next(new ErrorHandler("por favor inicia sesion", 400));
      }
      const decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as JwtPayload;
  
      if (!decoded) {
        return next(new ErrorHandler("Token de acceso no valido", 400));
      }
  
      const user = await redis.get(decoded.id);
      if (!user) {
        return next(new ErrorHandler("Uusario no encontrado", 400));
      }
      req.user = JSON.parse(user);
      next();
    }
  );
  

