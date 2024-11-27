import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { checkIfCustomized, responseBuilder } from "../../../lib/utils";

export const onSelectController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		
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
				order: { provider, items, payments, fulfillments,billing },
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

				billing

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

