require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { MidleWare } from './middleware/error'; // Importación corregida
import userRouter from "./routes/user.routes";

export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors
app.use(cors({ origin: process.env.ORIGIN }));

app.use("/api/v1", userRouter);

// testing Api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Testing API is working.",
    });
});

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Ruta ${req.originalUrl} no encontrada`) as any;
    err.statusCode = 404;
    next(err);
});

app.use(MidleWare);
