import { Request, Response } from "express";
import { ACTIONS, responseBuilder, B2B_EXAMPLES_PATH } from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";

export const onSearchController = (req: Request, res: Response) => {
	const { scenario } = req.query
	switch (scenario) {
		case 'rfq':
			onSearchDomesticController(req, res)
			break;
		case 'non-rfq':
			onSearchDomesticNonRfqController(req, res)
			break;
		case 'self-pickup':
			onSearchDomesticSelfPickupController(req, res)
			break;
		case 'exports':
			onSearchExportsController(req, res)
			break;
		case 'bap-chat':
			onSearchBAPchatController(req, res)
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
};

export const onSearchDomesticController = (req: Request, res: Response) => {
	const { context, message } = req.body;
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "select/select_domestic.yaml")
	);
	const response = YAML.parse(file.toString());

	const responseMessage = {
		order: {
			provider: {
				id: message.catalog.providers[0].id,
				locations: [
					{
						id: message.catalog.providers[0].items[0].location_ids[0]
					}
				],
				ttl: "P1D"
			},
			items: [
				{
					...response.value.message.order.items[0],
					id: message.catalog.providers[0].items[0].id,
					location_ids: [
						message.catalog.providers[0].items[0].location_ids[0]
					],
					fulfillment_ids: [
						message.catalog.providers[0].items[0].fulfillment_ids[0]
					]
				}
			],
			fulfillments: [
				{
					...response.value.message.order.fulfillments[0],
					type: message.catalog.providers[0].items[0].fulfillment_ids[0]
				}
			],
			payments: [
				message.catalog.payments[0]
			],
			tags: response.value.message.order.tags
		}
	}
	return responseBuilder(
		res,
		context,
		responseMessage,
		`${context.bpp_uri}/${ACTIONS.select}`,
		ACTIONS.select
	);
};

export const onSearchDomesticNonRfqController = (req: Request, res: Response) => {
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "select/select_domestic(Non RFQ).yaml")
	);
	const response = YAML.parse(file.toString());

	return responseBuilder(
		res,
		req.body.context,
		response.value.message,
		req.body.context.bpp_uri,
		`${ACTIONS.select}`
	);
};

export const onSearchDomesticSelfPickupController = (req: Request, res: Response) => {
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "select/select_domestic_SelfPickup.yaml")
	);
	const response = YAML.parse(file.toString());

	return responseBuilder(
		res,
		req.body.context,
		response.value.message,
		req.body.context.bpp_uri,
		`${ACTIONS.select}`
	);
};

export const onSearchExportsController = (req: Request, res: Response) => {
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "select/select_exports.yaml")
	);
	const response = YAML.parse(file.toString());

	return responseBuilder(
		res,
		req.body.context,
		response.value.message,
		req.body.context.bpp_uri,
		`${ACTIONS.select}`
	);
};

export const onSearchBAPchatController = (req: Request, res: Response) => {
	const file = fs.readFileSync(
		path.join(B2B_EXAMPLES_PATH, "select/select_BAP_chat.yaml")
	);
	const response = YAML.parse(file.toString());

	return responseBuilder(
		res,
		req.body.context,
		response.value.message,
		req.body.context.bpp_uri,
		`${ACTIONS.select}`
	);
};
