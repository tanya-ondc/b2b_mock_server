import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { checkIfCustomized, responseBuilder } from "../../../lib/utils";

export const onSelectController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (checkIfCustomized(req.body.message.order.items)) {
			return onSelectServiceCustomizedController(req, res, next);
		}
		return onSelectConsultationController(req, res, next);
	} catch (error) {
		return next(error);
	}
};

const onSelectConsultationController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			message: {
				order: { provider, items, payments, fulfillments },
			},
		} = req.body;

		const { id, type, stops } = fulfillments[0];
		const responseMessage = {
			order: {
				provider: {
					...provider,
					locations: [{ id: uuidv4() }],
				},

				items: items.map(
					({ location_ids, ...items }: { location_ids: any }) => items
				),

				billing: {
					name: "ONDC buyer",
					address:
						"22, Mahatma Gandhi Rd, Craig Park Layout, Ashok Nagar, Bengaluru, Karnataka 560001",
					state: {
						name: "Karnataka",
					},
					city: {
						name: "Bengaluru",
					},
					tax_id: "XXXXXXXXXXXXXXX",
					email: "nobody@nomail.com",
					phone: "9886098860",
				},

			},
		};
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bpp_uri}${
				req.body.context.bpp_uri.endsWith("/") ? "init" : "/init"
			}`,
			`init`,
			"services"
		);
	} catch (error) {
		next(error);
	}
};

const onSelectServiceCustomizedController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const {
		context,
		message: {
			order: { provider, items, payments, fulfillments },
		},
	} = req.body;

	const { id, type, stops } = fulfillments[0];
	const { id: parent_item_id, location_ids, ...item } = items[0];

	const responseMessage = {
		order: {
			provider: {
				...provider,
				locations: [{ id: uuidv4() }],
			},
			items: [
				items[0],
				...items
					.slice(1)
					.map(({ location_ids, ...item }: { location_ids: any }) => {
						return {
							...item,
							quantity: {
								measure: {
									unit: "unit",
									value: "1",
								},
							},
						};
					}),
			],
			billing: {
				name: "ONDC buyer",
				address:
					"22, Mahatma Gandhi Rd, Craig Park Layout, Ashok Nagar, Bengaluru, Karnataka 560001",
				state: {
					name: "Karnataka",
				},
				city: {
					name: "Bengaluru",
				},
				tax_id: "XXXXXXXXXXXXXXX",
				email: "nobody@nomail.com",
				phone: "9886098860",
			},
			fulfillments: [
				{
					id,
					type,
					stops: [
						{
							location: {
								gps: "12.974002,77.613458",
								address: "My House #, My buildin",
								city: {
									name: "Bengaluru",
								},
								country: {
									code: "IND",
								},
								area_code: "560001",
								state: {
									name: "Karnataka",
								},
							},
							contact: {
								phone: "9886098860",
							},
							time: stops[0]?.time,
						},
					],
				},
			],
			payments,
		},
	};

	return responseBuilder(
		res,
		next,
		context,
		responseMessage,
		`${req.body.context.bpp_uri}${
			req.body.context.bpp_uri.endsWith("/") ? "init" : "/init"
		}`,
		`init`,
		"services"
	);
};
