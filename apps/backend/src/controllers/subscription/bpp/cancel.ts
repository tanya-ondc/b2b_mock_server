import { NextFunction, Request, Response } from "express";
import {
	responseBuilder,
	redisFetchFromServer,
	send_nack,
	updateFulfillments,
} from "../../../lib/utils";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import {
	ORDER_CACELLED_BY,
	ORDER_STATUS,
} from "../../../lib/utils/apiConstants";

export const cancelController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { scenario } = req.query;
		const { transaction_id } = req.body.context;
		const on_confirm_data = await redisFetchFromServer(
			ON_ACTION_KEY.ON_CONFIRM,
			transaction_id
		);
		if (!on_confirm_data) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED);
		}

		if (on_confirm_data.message.order.id != req.body.message.order_id) {
			return send_nack(res, ERROR_MESSAGES.ORDER_ID_DOES_NOT_EXISTED);
		}

		// const on_search_data = await redisFetchFromServer(
		// 	ON_ACTION_KEY.ON_SEARCH,
		// 	transaction_id
		// );

		// const item_measure_ids =
		// 	on_search_data.message.catalog.providers[0].items.reduce(
		// 		(accumulator: any, currentItem: any) => {
		// 			accumulator[currentItem.id] = currentItem.quantity
		// 				? currentItem.quantity.unitized.measure
		// 				: undefined;
		// 			return accumulator;
		// 		},
		// 		{}
		// 	);
		// req.body.item_measure_ids = item_measure_ids;
		cancelRequest(req, res, next, on_confirm_data, scenario);
	} catch (error) {
		return next(error);
	}
};

const cancelRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: any
) => {
	try {
		const { context } = req.body;
		// const updatedFulfillments = updateFulfillments(
		// 	transaction.message.order.fulfillments,
		// 	ON_ACTION_KEY?.ON_CANCEL
		// );

		const responseMessage = {
			order: {
				id: req.body.message.order_id,
				status: ORDER_STATUS.CANCELLED,
				cancellation: {
					cancelled_by: ORDER_CACELLED_BY.CONSUMER,
					reason: {
						descriptor: {
							code: req.body.message.cancellation_reason_id,
						},
					},
				},
				provider: {
					...transaction.message.order.provider,
					rateable: undefined,
				},

				items: transaction.message.order.items.map((itm: any) => ({
					...itm,
					quantity: {
						...itm.quantity,
					},
				})),

				quote: transaction.message.order.quote,
				fulfillments: transaction.message.order.fulfillments,
				billing: transaction.message.order.billing,
				payments: transaction.message.order.payments.map((itm: any) => ({
					...itm,
					tags: itm.tags.filter(
						(tag: any) => tag.descriptor.code !== "Settlement_Counterparty"
					),
				})),
				cancellation_terms: [
					{
						fulfillment_state: {
							descriptor: {
								code: "PENDING",
								short_desc: "002",
							},
						},
						cancellation_fee: {
							percentage: "0.00",
							amount: {
								currency: "INR",
								value: "0.00",
							},
						},
					},
				],
				updated_at: new Date().toISOString(),
			},
		};

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_CANCEL
					: `/${ON_ACTION_KEY.ON_CANCEL}`
			}`,
			`${ON_ACTION_KEY.ON_CANCEL}`,
			"subscription"
		);
	} catch (error) {
		next(error);
	}
};
