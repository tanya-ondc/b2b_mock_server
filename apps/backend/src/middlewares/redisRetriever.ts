//new code no changes done

import { NextFunction, Request, Response } from "express";
import { logger, redis } from "../lib/utils";

export const redisRetriever = async (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	console.log("MODE:", req.headers["mode"])
	// if (req.headers["mode"] === "mock") {
	// 	next();
	// 	return;
	// }
	const {
		context: { transaction_id, action },message
	} = req.body;
	// let transaction = await redis.get(`${transaction_id}-${action}-to-server`);
	// let logs: TransactionType;
	// logger.info("---------------------------------")
	// logger.info("TIME:", Date.now())
	// logger.info("FOR ACTION:", action)
	// logger.info("PICKED FROM REDIS", transaction)
	// logger.info("---------------------------------")

	// let logs: TransactionType;
	// // if (!transaction) {
	// logs = {
	// 	request: req.body,
	// };
	

	let ts = new Date().toISOString();
	
	if (action !== "status" && action !== "on_status") {
		
		
		


		console.log("storing in redis", `${transaction_id}-${action}-to-server`);
		await redis.set(
			`${transaction_id}-${action}-to-server`,
			JSON.stringify({
				request: req.body,
			})
		);
	} else {
		const transactionKeys = await redis.keys(`${transaction_id}-*`);
		const logIndex = transactionKeys.filter((e) =>
			e.includes(`${action}-to-server`)
		).length;

		await redis.set(
			`${transaction_id}-${logIndex}-${action}-to-server`,
			JSON.stringify({
				request: req.body,
			})
		);
	}

	// next();
	// return;
	// } else {
	// logs = JSON.parse(transaction);
	// // }

	// res.locals.logs = logs;
	next();
};
