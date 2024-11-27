import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	MOCKSERVER_ID,
	send_response,
	send_nack,
	redisFetchToServer,
	AGRI_BAP_MOCKSERVER_URL,
	redis,
	logger,
} from "../../../lib/utils";
import {
	ACTTION_KEY,
	ON_ACTION_KEY,
} from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { ORDER_STATUS, PAYMENT_STATUS } from "../../../lib/utils/apiConstants";

export const initiateConfirmController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { scenario, transactionId } = req.body;
		const on_search = await redisFetchToServer(
			ON_ACTION_KEY.ON_SEARCH,
			transactionId
		);
		const providersItems =
			on_search?.message?.catalog["bpp/providers"][0]?.items;
		const on_init = await redisFetchToServer(
			ON_ACTION_KEY.ON_INIT,
			transactionId
		);
		if (!on_init) {
			return send_nack(res, ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED);
		}
		return intializeRequest(res, next, on_init, scenario, providersItems);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string,
	providersItems: any
) => {
	try {
		let {
			context,
			message: {
				order: { provider,quote, payment, fulfillments, xinput, items },
			},
		} = transaction;
		const { transaction_id } = context;

		// const { stops, ...remainingfulfillments } = fulfillments[0];

		const timestamp = new Date().toISOString();

		const confirm = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: ACTTION_KEY.CONFIRM,
				bap_id: MOCKSERVER_ID,
				bap_uri: AGRI_BAP_MOCKSERVER_URL,
				message_id: uuidv4(),
			},
			message: {
				order: {
					...transaction.message.order,
					id: uuidv4(),
					state: ORDER_STATUS.CREATED.toUpperCase(),
					provider,
					fulfillments,
					items:items.map((itm:any)=>(
						{
							id:itm.id,
							fulfillment_id:itm.fulfillment_id,
							quantity: {
								count: 2,
							},
						}
					)),
					payment: {
						...payment,
						"@ondc/org/settlement_details": [
							{
								bank_name: "HDFC",
								beneficiary_name: "Agro Fertilizer Pvt. Ltd.",
								branch_name: "Gurugram",
								settlement_bank_account_no: "38366111323636",
								settlement_counterparty: "buyer-app",
								settlement_ifsc_code: "HDFC00000",
								settlement_phase: "sale-amount",
								settlement_type: "neft",
							},
						],
						collected_by: "BPP",
						params: {
							amount: quote?.price.value,
							currency: "INR",
						},
					},
					created_at: timestamp,
					updated_at: timestamp,
				},
			},
		};
		await send_response(
			res,
			next,
			confirm,
			transaction_id,
			"confirm",
			(scenario = scenario)
		);
	} catch (error) {
		next(error);
	}
};
