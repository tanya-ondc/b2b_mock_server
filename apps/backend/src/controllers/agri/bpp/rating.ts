import { NextFunction, Request, Response } from "express";
import {
  send_ack,
} from "../../../lib/utils";

export const ratingController = async (req: Request, res: Response, next: NextFunction) => {
	return send_ack(res)
}

