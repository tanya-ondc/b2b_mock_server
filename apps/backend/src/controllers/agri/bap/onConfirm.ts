import { Request, Response } from "express";
import { send_ack } from "../../../lib/utils";

export const onConfirmController = (req: Request, res: Response) => {
	return send_ack(res)
};
