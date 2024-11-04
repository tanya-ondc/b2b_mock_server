import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	send_nack,
	send_response,
	redisFetchToServer,
	B2C_EXAMPLES_PATH,
  B2B_EXAMPLES_PATH,
	RETAIL_BAP_MOCKSERVER_URL,
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { v4 as uuidv4 } from "uuid";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";

export const initiateSelectController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { scenario, transactionId } = req.body;
		const { version } = req.query;

		const on_search = await redisFetchToServer(
			ON_ACTION_KEY.ON_SEARCH,
			transactionId
		);
		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}
		return intializeRequest(res, next, on_search, scenario, version);
	} catch (error) {
		return next(error);
	}
};

const intializeRequest = async (
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string,
	version: any
) => {
	try {
		const { context, message } = transaction;
		const { transaction_id } = context;

		let file: any = "";

		console.log("versionnnnnnnnn",version)
    switch(version){
      case "b2c":
        file = fs.readFileSync(
          path.join(B2C_EXAMPLES_PATH, "select/select_exports.yaml")
        );
      case "b2b":
        file = fs.readFileSync(
          path.join(B2B_EXAMPLES_PATH, "select/select_domestic.yaml")
        );
			default:
				file = fs.readFileSync(
          path.join(B2B_EXAMPLES_PATH, "select/select_domestic.yaml")
        );
    }
		
		const response = YAML.parse(file.toString());


		if (scenario !== "rfq") {
			delete response?.value?.message?.order?.items[0]?.tags;
		}
		const select = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: "select",
				message_id: uuidv4(),
				ttl: scenario === "rfq" ? "P1D" : "PT30S",
				bap_id: MOCKSERVER_ID,
				bap_uri: RETAIL_BAP_MOCKSERVER_URL,
			},
			message: {
				order: {
					provider: {
						id: message.catalog.providers[0].id,
						locations: [
							{
								id: message.catalog.providers[0].items[0].location_ids[0],
							},
						],
						ttl: scenario === "rfq" ? "P1D" : "PT30S",
					},
					items: [
						{
							...response?.value?.message?.order?.items[0],
							id: message.catalog.providers[0].items[0].id,
							location_ids: [
								message.catalog.providers[0].items[0].location_ids[0],
							],
							fulfillment_ids: [
								message.catalog.providers[0].items[0].fulfillment_ids[0],
							],
						},
					],
					fulfillments: [
						{
							...message.catalog.fulfillments[0],
							type: message.catalog.providers[0].items[0].fulfillment_ids[0],
						},
					],
					payments: [message.catalog.payments[0]],
					tags: response.value.message.order.tags,
				},
			},
		};
		await send_response(
			res,
			next,
			select,
			transaction_id,
			"select",
			(scenario = scenario),
			version
		);
	} catch (err) {
		return next(err);
	}
};
