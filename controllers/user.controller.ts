import { Request, Response, NextFunction } from "express";
import UserModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "../utils/catchAsyncError";
import jwt, { Secret } from "jsonwebtoken";
import ejs from 'ejs'
import path from 'path';
import sendMail from '../utils/sendMail';


interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string
}

export const registrationUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const isEmailExist = await UserModel.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler('Email already exists', 400));
    }
    const user: IRegistrationBody = {
      name,
      email,
      password
    };

    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    const data = { user: { name: user.name }, activationCode };
    const html = await ejs.renderFile(path.join(__dirname, '../mails/activation.mail.ejs'), data);
    try {
      await sendMail({
        email: user.email,
        subject: 'activa tu cuenta',
        template: 'activation.mail.ejs',
        data,
      });
      res.status(201).json({
        success: true,
        message: `revisa tu correo ${user.email} para activar tu cuenta`,
        activationToken: activationToken.token,
        activationCode: activationCode
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

interface IActivationToken {
  token: string;
  activationCode: string;
}

const createActivationToken = (user: IRegistrationBody): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign({
    user, activationCode

  },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: '5m'
    }
  );

  return { token, activationCode };
};

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } = req.body as IActivationRequest;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }
      const { name, email, password } = newUser.user;
      const existUser = await UserModel.findOne({ email });

      if (existUser) {
          return next(new ErrorHandler("Email already exists", 400));
      }

      const user = await UserModel.create({
        name,
        email,
        password,
      });
      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
