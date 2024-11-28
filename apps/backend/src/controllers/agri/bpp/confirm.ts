import { NextFunction, Request, Response } from "express";
import {
	checkIfCustomized,
	redisFetchFromServer,
	responseBuilder,
	send_nack,
	Stop,
	updateFulfillments,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ORDER_STATUS } from "../../../lib/utils/apiConstants";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";

export const confirmController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (checkIfCustomized(req.body.message.order?.items)) {
			return confirmServiceCustomizationController(req, res, next);
		}
		
		confirmConsultationController(req, res, next);
	} catch (error) {
		return next(error);
	}
};

export const confirmConsultationController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			message: { order },
		} = req.body;

		const on_init = await redisFetchFromServer(
			ON_ACTION_KEY.ON_INIT,
			context?.transaction_id
		);

		if (on_init && on_init?.error) {
			return send_nack(
				res,
				on_init?.error?.message
					? on_init?.error?.message
					: ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED
			);
		}

		if (!on_init) {
			return send_nack(res, ERROR_MESSAGES.ON_INIT_DOES_NOT_EXISTED);
		}

		const { fulfillments } = order;
		const responseMessage = {
			order: {
				...order,
				status: ORDER_STATUS.ACCEPTED.toUpperCase(),
				fulfillments: [{
					...fulfillments[0],
					start: {
						contact: {
							email: "tech-support@test.com",
							phone: "9900000000",
						},
						location: {
							id: "5009-L1",
							gps: "12.974002,77.613458",
							address: {
								city: "Bengaluru",
								name: "Ramu",
								state: "Karnataka",
								country: "IND",
								building: "Agro Fertilizer Store",
								locality:
									"Agro Fertilizer Store, Farm 14 Near Village, Bengaluru, Karnataka, 560001",
								area_code: "560001",
							},
							descriptor: {
								name: "Agro Fertilizer Store",
							},
						},
					},
					state: {
						descriptor: {
							code: "Pending",
						},
					},
					"@ondc/org/TAT": "P2D",
					"@ondc/org/category": "Standard Delivery",
					"@ondc/org/provider_name": "Agro Fertilizer Store",
				}],
				provider: {
					...order.provider,
					rateable: true,
				},
			},
		};

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_CONFIRM
					: `/${ON_ACTION_KEY.ON_CONFIRM}`
			}`,
			`${ON_ACTION_KEY.ON_CONFIRM}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}
};

export const confirmServiceCustomizationController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			message: { order },
		} = req.body;
		const { fulfillments } = order;
		const timestamp = new Date();
		const end_time = new Date(timestamp.getTime() + 30 * 60 * 1000);
		// const fulfillments = response.value.message.order.fulfillments

		context.action = "on_confirm";
		fulfillments[0].stops?.splice(0, 0, {
			id: "L1",
			type: "start",
			location: {
				id: "L1",
				descriptor: {
					name: "ABC Store",
				},
				gps: "12.956399,77.636803",
			},
			time: {
				range: {
					start: timestamp.toISOString(),
					end: end_time.toISOString(),
				},
			},
			contact: {
				phone: "9886098860",
				email: "nobody@nomail.com",
			},
			person: {
				name: "Kishan",
			},
		});
		fulfillments[0].stops.forEach((itm: Stop) => {
			if (itm.type === "end") {
				itm.id = "L2";
				itm.authorization = {
					type: "OTP",
					token: "1234",
					valid_from: "2023-11-16T09:30:00.000Z",
					valid_to: "2023-11-16T09:35:00.000Z",
					status: "valid",
				};
				itm.person = { name: itm?.customer?.person?.name || "" };
				itm.customer = undefined;
			}
		});
		const responseMessage = {
			order: {
				...order,
				status: "Accepted",
				provider: {
					...order?.provider,
					rateable: true,
				},
				fulfillments: [
					{
						...fulfillments[0],
						// state hard coded
						state: {
							descriptor: {
								code: "PENDING",
							},
						},
						rateable: true,
						// stops:
					},
				],
			},
		};
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_confirm" : "/on_confirm"
			}`,
			`on_confirm`,
			"services"
		);
	} catch (error) {
		return next(error);
	}
};
