import { Request, Response } from "express";
import { ACTIONS, responseBuilder, B2B_EXAMPLES_PATH } from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";

export const confirmDomesticController = (req: Request, res: Response) => {
	const { context, message } = req.body;
	const start = new Date(message.order.created_at);
	start.setHours(start.getHours() + 1);
	const end = new Date(message.order.created_at);
	end.setHours(end.getHours() + 2);

	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "on_confirm/on_confirm_domestic.yaml")
	);

	const response = YAML.parse(file.toString());

	const responseMessage = {
		order: {
			...message.order,
			state: "Accepted",
			provider: {
				...message.provider,
				rateable: true,
			},
			fulfillments: message.order.fulfillments.map((eachFulfillment: any) => ({
				...eachFulfillment,
				"@ondc/org/provider_name":
					response.value.message.order.fulfillments[0][
					"@ondc/org/provider_name"
					],
				state: response.value.message.order.fulfillments[0].state,
				stops: [
					...eachFulfillment.stops,
					{
						...response.value.message.order.fulfillments[0].stops[0],
						time: {
							range: {
								start: start.toISOString(),
								end: end.toISOString(),
							},
						},
					},
				],
			})),
		}
	};
	return responseBuilder(
		res,
		context,
		responseMessage,
		`${context.bap_uri}/on_${ACTIONS.confirm}`,
		`on_${ACTIONS.confirm}`
	);
};

export const confirmController = (req: Request, res: Response) => {
	const { scenario } = req.query
	switch (scenario) {
		case 'rfq':
			confirmDomesticController(req, res)
			break;
		case 'non-rfq':
			confirmDomesticNonRfq(req, res)
			break;
		case 'exports':
			confirmExports(req, res)
			break;
		case 'rejected':
			confirmDomesticRejected(req, res)
			break;
		default:
			res.status(404).json({
				message: {
					ack: {
						status: "NACK",
					},
				},
				error: {
					message: "Invalid scenario",
				},
			});
			break;
	}
}

// export const confirmDomestic = (req: Request, res: Response) => {
// 	return responseBuilder(
// 		res,
// 		req.body.context,
// 		onConfirmDomestic.message,
// 		req.body.context.bap_uri,
// 		`on_${ACTIONS.confirm}`
// 	);
// };

export const confirmDomesticNonRfq = (req: Request, res: Response) => {
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "on_confirm/on_confirm_domestic_non_rfq.yaml")
	);

	const response = YAML.parse(file.toString());

	return responseBuilder(
		res,
		req.body.context,
		response.value.message,
		req.body.context.bap_uri,
		`on_${ACTIONS.confirm}`
	);
};

export const confirmExports = (req: Request, res: Response) => {
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "on_confirm/on_confirm_exports.yaml")
	);

	const response = YAML.parse(file.toString());

	return responseBuilder(
		res,
		req.body.context,
		response.value.message,
		req.body.context.bap_uri,
		`on_${ACTIONS.confirm}`
	);
};

export const confirmDomesticRejected = (req: Request, res: Response) => {
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "on_confirm/on_confirm_domestic_rejected.yaml")
	);

	const response = YAML.parse(file.toString());

	return responseBuilder(
		res,
		req.body.context,
		response.value.message,
		req.body.context.bap_uri,
		`on_${ACTIONS.confirm}`
	);
};