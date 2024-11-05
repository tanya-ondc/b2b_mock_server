import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	quoteCreatorHealthCareService,
	quoteCreatorService,
	redisFetchToServer,
	responseBuilder,
	send_nack,
	updateFulfillments,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import {
	FULFILLMENT_LABELS,
	FULFILLMENT_STATES,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";

export const updateController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let { scenario } = req.query;
		scenario =
			scenario === "fulfillments"
				? "reschedule"
				: scenario === "items"
				? "modifyItems"
				: "payments";

		const on_confirm = await redisFetchToServer(
			ON_ACTION_KEY.ON_CONFIRM,
			req.body.context.transaction_id
		);
		if (!on_confirm) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED);
		}

		const on_search = await redisFetchToServer(
			ON_ACTION_KEY.ON_SEARCH,
			req.body.context.transaction_id
		);

		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}

		const providersItems = on_search?.message?.catalog?.providers[0];
		req.body.providersItems = providersItems;

		//UPDATE FULFILLMENTS HERE BECAUSE It IS SAME FOR ALL SACENRIOS
		const updatedFulfillments = updateFulfillments(
			req?.body?.message?.order?.fulfillments,
			ON_ACTION_KEY?.ON_UPDATE
		);
		req.body.message.order.fulfillments = updatedFulfillments;
		req.body.on_confirm = on_confirm;

		switch (scenario) {
			case "reschedule":
				updateRescheduleController(req, res, next);
				break;
			case "payments":
				updatePaymentController(req, res, next);
				break;
			case "modifyItems":
				updateRescheduleAndItemsController(req, res, next);
				break;
			default:
				updateRequoteController(req, res, next);
				break;
		}
	} catch (error) {
		return next(error);
	}
};

//HANDLE PAYMENTS TARGET
export const updateRequoteController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, on_confirm } = req.body;
		//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS

		const responseMessages = {
			order: {
				...message.order,
				id: uuidv4(),
				status: FULFILLMENT_STATES.PENDING,
				ref_order_ids: [on_confirm?.message?.order?.id],
				provider: {
					id: on_confirm?.message?.order?.provider.id,
				},
			},
		};

		return responseBuilder(
			res,
			next,
			context,
			responseMessages,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_UPDATE
					: `/${ON_ACTION_KEY.ON_UPDATE}`
			}`,
			`${ON_ACTION_KEY.ON_UPDATE}`,
			"services"
		);
	} catch (error) {
		next(error);
	}
};

//HANDLE UPDATE PAYMENTS AFTER ITEMS UPDATE
export const updatePaymentController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { context, message, on_confirm } = req.body;
	const responseMessages = {
		order: {
			...message.order,
			id: uuidv4(),
			status: FULFILLMENT_STATES.PENDING,
			ref_order_ids: [on_confirm?.message?.order?.id],
			provider: {
				id: on_confirm?.message?.order?.provider.id,
			},
		},
	};
	
	return responseBuilder(
		res,
		next,
		context,
		responseMessages,
		`${req.body.context.bap_uri}${
			req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_UPDATE
				: `/${ON_ACTION_KEY.ON_UPDATE}`
		}`,
		`${ON_ACTION_KEY.ON_UPDATE}`,
		"services"
	);


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

//HANDLE FULFILLMENT TARGET (TIME SLOT RESCHEDULE,ITEMS AND PATIENTS)(MODIFY NUMBER OF PATIENTS AND NUMBER OF TEST)
export const updateRescheduleAndItemsController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			message: { order },
			on_confirm,
			providersItems,
		} = req.body;

		const domain = context?.domain;
		//Add total quantity of items using coming request and on_confirm order

		//on_confirm items selected
		const on_confirm_quantity =
			on_confirm?.message?.order?.items[0]?.quantity?.selected?.count;

		const update_item_quantity = Number(
			order?.items[0]?.quantity?.unitized?.measure?.value?order?.items[0]?.quantity?.unitized?.measure?.value:"2"
		);

		if(order?.items[0]?.quantity?.unitized?.measure?.value){
			order.items[0].quantity.unitized.measure.value =
			on_confirm_quantity + update_item_quantity;
		}
		
		//UPDATE PAYMENT OBJECT AND QUOTE ACCORDING TO ITEMS AND PERSONS
		const quote =
			domain === SERVICES_DOMAINS.SERVICES
				? quoteCreatorService(order?.items, providersItems?.items)
				: domain === SERVICES_DOMAINS.BID_ACTION_SERVICES
				? quoteCreatorHealthCareService(
						order?.items,
						providersItems?.items,
						"",
						order?.fulfillments[0]?.type,
						"bid_auction_service"
				  )
				: domain === SERVICES_DOMAINS.AGRI_EQUIPMENT
				? quoteCreatorHealthCareService(
						order?.items,
						providersItems?.items,
						providersItems?.offers,
						order?.fulfillments[0]?.type,
						"agri-equipment-hiring"
				  )
				: quoteCreatorHealthCareService(
						order?.items,
						providersItems?.items,
						"",
						order?.fulfillments[0]?.type
				  );

		//UPDATE PAYMENT OBJECT ACCORDING TO QUANTITY
		const updatedPaymentObj = updatePaymentObject(
			order?.payments,
			(
				update_item_quantity * parseFloat(order.items[0]?.price?.value)
			).toString()
		);

		const responseMessage = {
			order: {
				...order,
				id: uuidv4(),
				ref_order_ids: [on_confirm?.message?.order?.id],
				payments: updatedPaymentObj,
				quote,
			},
		};

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_UPDATE
					: `/${ON_ACTION_KEY.ON_UPDATE}`
			}`,
			`${ON_ACTION_KEY.ON_UPDATE}`,
			"services"
		);
	} catch (error) {
		next(error);
	}
};

//UPDATE PAYMENT OBJECT FUNCTION HANDLE HERE
function updatePaymentObject(payments: any, quotePrice: any) {
	try {
		//GET TOTAL AMOUNT OF PAYMENT

		payments.push({
			...payments[0],
			id: "PY2",
			params: {
				...payments[0].params,
				amount: quotePrice,
				transaction_id: uuidv4(),
			},
			status: "NOT-PAID",
		});
		return payments;
	} catch (error) {
		console.log("error ocuured in payment object:", error);
	}
}

export const updateRescheduleController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const {
		context,
		message: { order },
	} = req.body;

	const responseMessage = {
		...order,
		fulfillments: [
			{
				...order.fulfillments[0],
				stops: order.fulfillments[0].stops.map((stop: any) => ({
					...stop,
					time:
						stop.type === "end"
							? { ...stop.time, label: FULFILLMENT_LABELS.CONFIRMED }
							: stop.time,
				})),
			},
		],
	};

	return responseBuilder(
		res,
		next,
		context,
		responseMessage,
		`${req.body.context.bap_uri}${
			req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_UPDATE
				: `/${ON_ACTION_KEY.ON_UPDATE}`
		}`,
		`${ON_ACTION_KEY.ON_UPDATE}`,
		"services"
	);
};
