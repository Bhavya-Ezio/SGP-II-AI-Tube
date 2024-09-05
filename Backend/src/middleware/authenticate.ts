import jwt from 'jsonwebtoken';
import passport, { authenticate } from 'passport';
import express from 'express';
import { resBody } from '../models/req&res';
import { User } from '../models/user';

export const authenticateToken = (req: express.Request<{}, resBody, User>, res: express.Response<resBody>, next: express.NextFunction) => {
  const token = req.cookies?.accessToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      req.user = decoded;
      next();
    } catch (err) {
      console.log(err);
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }
  } else {
    return res.status(401).json({
      message: 'Unauthorized',
      success: false
    });
  }
};
