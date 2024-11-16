import { Request, Response } from "express";

export const onStatusController = (req: Request, res: Response) => {
	return res.json({
		sync: {
			message: {
				ack: {
					status: "ACK",
				},
			},
		},
	});
};
