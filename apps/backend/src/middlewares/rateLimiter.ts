import { NextFunction, Request, Response } from "express";
// import { SubscriberDetail } from "../interfaces";
import { split_auth_header } from "../lib/utils";
export const rateLimiter = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const mode = req.query.mode;
	if (process.env.RATE_LIMIT_MODE=== "true" && mode === "sandbox") {
		const header = req.headers["authorization"] || "";
		const parts = split_auth_header(header);
		if (!parts || Object.keys(parts).length === 0) {
			throw new Error("Header parsing failed");
		}

		const subscriber_id = parts["keyId"].split("|")[0] as string;
		//  const unique_key_id = parts["keyId"].split("|")[1] as string;
		// const a = await redis.get(`subscriber_data-${subscriber_id}-${unique_key_id}`)
		// const subscriber = await prisma.user.findFirst({
		// 	where: {
		// 		subscriber_id,
		// 	},
		// });
		// console.log("subscriber_id",a)
		// if (
		// 	new Date().getTime() - subscriber?.lastAccessed?.getTime()! <
		// 	24 * 60 * 60 * 1000
		// ) {
		// 	if (subscriber?.accessCount! > parseInt(process.env.RATE_LIMIT_24HR!)) {
		// 		res.status(401).json({
		// 			message: {
		// 				ack: {
		// 					status: "NACK",
		// 				},
		// 			},
		// 			error: {
		// 				message: "Rate Limit Exceeded",
		// 			},
		// 		});
		// 	}
		// }
	}
	next();
};
