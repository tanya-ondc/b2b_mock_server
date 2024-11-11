import { NextFunction, Request, Response } from "express";
import { verifyHeader } from "../lib/utils/auth";
import { Locals } from "../interfaces";
import { B2B_BAP_MOCKSERVER_URL, logger } from "../lib/utils";

export const authValidatorMiddleware = async (
	req: Request,
	res: Response<{}, Locals>,
	next: NextFunction
) => {
	try {
		const mode = req.query.mode as string;
		res.setHeader("mode", mode ? mode : "sandbox");
		if (
			mode === "mock" 
			||
			(req.body.context.bap_uri === B2B_BAP_MOCKSERVER_URL &&
				req.body.context.action === "search")
		) {
			next(); //skipping auth header validation in "mock" mode
			return;
		} else {
			const auth_header = req.headers["authorization"] || "";
			let verified = await verifyHeader(auth_header, (req as any).rawBody.toString());
			console.log("VERIFIED :::", verified)
			if (!verified) {
				return res.status(401).json({
					message: {
						ack: {
							status: "NACK",
						},
					},
					error: {
						message: "Authentication failed",
					},
				});
			}
			next();
		}
	} catch (err) {
		logger.error(err)
		console.log("Error in authValidatorMiddleware", err);
		return res.status(401).json({
			message: {
				ack: {
					status: "NACK",
				},
			},
			error: {
				message: "Authentication failed with Error",
			},
		});
	}
};
