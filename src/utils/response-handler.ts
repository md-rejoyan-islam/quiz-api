import { Response } from "express";

export const successResponse = (
  res: Response,
  {
    statusCode = 200,
    message = "Success",
    payload,
  }: {
    statusCode: number;
    message: string;
    payload?: any;
  }
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...payload,
  });
};
