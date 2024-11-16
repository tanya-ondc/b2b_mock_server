import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	send_response,
	send_nack,
	redisFetchToServer,
} from "../../../lib/utils";
import { ACTTION_KEY, ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";


export const initiateCancelController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try{
		const { transactionId, orderId, cancellationReasonId } = req.body;
		const on_confirm = await redisFetchToServer(ON_ACTION_KEY.ON_CONFIRM, transactionId);
		if (!on_confirm) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED)
		}
		return intializeRequest(res, next, on_confirm, orderId, cancellationReasonId);
	}catch(error){
		return next(error)
	}
	
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	order_id: string,
	cancellation_reason_id: string
) => {
	try{
		const { context } = transaction;
		let scenario = "ack"
		const cancel = {
			context: {
				...context,
				action: ACTTION_KEY.CANCEL,
				message_id: uuidv4(),
			},
			message: {
				order_id,
				cancellation_reason_id,
			},
		};
		await send_response(res, next, cancel, context.transaction_id, ACTTION_KEY.CANCEL, scenario = scenario);
	}catch(error){
		next(error)
	}

};
