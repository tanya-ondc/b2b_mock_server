import { NextFunction, Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";

import {
	MOCKSERVER_ID,
	redisFetchToServer,
	send_nack,
	send_response,
	SERVICES_BAP_MOCKSERVER_URL,
} from "../../../lib/utils";

import {
	ACTTION_KEY,
	ON_ACTION_KEY,
} from "../../../lib/utils/actionOnActionKeys";

import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";

export const initiateRatingController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { scenario, transactionId } = req.body;
		const on_select = await redisFetchToServer(
			ON_ACTION_KEY.ON_SELECT,
			transactionId
		);
		if (!on_select) {
			return send_nack(res, ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED);
		}
		if (Object.keys(on_select).includes("error")) {
			return send_nack(res, ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED);
		}
		return intializeRequest(res, next, on_select, scenario);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string
) => {
	try {
		const {
			context,
			message: {
				order: { items },
			},
		} = transaction;

		const rating = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.RATING,
				bap_id: MOCKSERVER_ID,
				bap_uri: SERVICES_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				ratings: [
					{
						rating_category: "Item",
						id: items[0]?.id,
						value: "4.4",
					},
				],
			},
		};
    
		await send_response(
			res,
			next,
			rating,
			context.transaction_id,
			ACTTION_KEY.RATING,
			(scenario = scenario)
		);
	} catch (error) {
		next(error);
	}
};
