import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	MOCKSERVER_ID,
	send_response,
	send_nack,
	redisFetchToServer,
	SUBSCRIPTION_BAP_MOCKSERVER_URL,
} from "../../../lib/utils";
import { ACTTION_KEY, ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../../lib/utils/apiConstants";

export const initiateConfirmController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try{
		const {transactionId } = req.body;
		const { scenario} = req.query;
		const on_search = await redisFetchToServer(ON_ACTION_KEY.ON_SEARCH, transactionId);
		const providersItems = on_search?.message?.catalog?.providers[0]?.items;
		const on_init = await redisFetchToServer(ON_ACTION_KEY.ON_INIT, transactionId)
		if (!on_init) {
			return send_nack(res, ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED)
		}
		return intializeRequest(res, next, on_init, scenario, providersItems);
	}catch(error){
		return next(error)
	}
	
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: any,
	providersItems: any
) => {
	try{
		const {
			context,
			message: {
				order: {
					provider,
					locations,
					payments,
					fulfillments,
					xinput,
					items,
				},
			},
		} = transaction;
		const { transaction_id } = context;
		const { stops, ...remainingfulfillments } = fulfillments[0];
	
		const timestamp = new Date().toISOString();

		const confirm = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.CONFIRM,
				bap_id: MOCKSERVER_ID,
				bap_uri: SUBSCRIPTION_BAP_MOCKSERVER_URL,
				message_id: uuidv4()
			},
			message: {
				order: {
					...transaction.message.order,
					id: uuidv4(),
					status: ORDER_STATUS.CREATED,
					provider: {
						...provider,
						locations,
					},
					fulfillments,
					payments: [
						{
							...payments[0],
							params: {
								...payments[0].params,
								transaction_id: uuidv4(),
							},
							status: PAYMENT_STATUS.NON_PAID,
						},
					],
					created_at: timestamp,
					updated_at: timestamp,
				},
			},
		};
		console.log("scenariooooooooooooooo",scenario)
		await send_response(res, next, confirm, transaction_id, "confirm", (scenario = scenario));
	}catch(error){
		next(error)
	}
};
