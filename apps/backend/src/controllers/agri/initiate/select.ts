import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	AGRI_BAP_MOCKSERVER_URL,
	checkIfCustomized,
	send_response,
	send_nack,
	redisFetchToServer,
	Item,
	logger,
	redis,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";
import { set, eq } from "lodash";
import _ from "lodash";

export const initiateSelectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transactionId } = req.body;

		const on_search = await redisFetchToServer("on_search", transactionId);
		if (!on_search) {
			return send_nack(res, "On Search doesn't exist");
		}
		return intializeRequest(req, res, next, on_search);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
	transaction: any
) => {
	try {
		const { context, message } = transaction;
		const { transaction_id } = context;
		const providers = message?.catalog["bpp/providers"];
		const { id, locations } = providers?.[0];
		let items ;

		const flowKey = await redis.keys(`${transaction_id}-flow*`)
		const flow = flowKey[0].slice(-1)
		logger.info(`flow is ${flow}`)

		items = providers[0].items = 
			providers?.[0]?.items.map(
				({
					id,
					location_id,
				}: {
					id: string;
					location_id: string[];
				}) => ( {id, location_id })
			)

		const select = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: "select",
				bap_id: MOCKSERVER_ID,
				bap_uri: AGRI_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
					provider: {
						id,
						locations: [
							{
								id: locations?.[0]?.id,
							},
						],
					},
					 items : items.map((itm:any) => ({
						...itm,           
						quantity: { count: 1 }  
					  })),
					fulfillments: [
						{
							end: {
								location: {
									gps: "12.974002,77.613458",
									address: {
										area_code: "560001",
									},
								},
							},
						},
					],
					payment: { type: "ON-FULFILLMENT" },
				},
			},
		};
		console.log("items",JSON.stringify(select.message.order.items))
		await send_response(res, next, select, transaction_id, "select");
	} catch (error) {
		return next(error);
	}
};
