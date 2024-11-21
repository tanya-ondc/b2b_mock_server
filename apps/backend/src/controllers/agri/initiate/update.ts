import { NextFunction, Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { v4 as uuidv4 } from "uuid";
import {
	send_nack,
	createAuthHeader,
	redis,
	redisFetchToServer,
	AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH,
	SERVICES_BPP_MOCKSERVER_URL,
	send_response,
	AGRI_EXAMPLES_PATH,
	AGRI_BPP_MOCKSERVER_URL,
} from "../../../lib/utils";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import {
	ACTTION_KEY,
	ON_ACTION_KEY,
} from "../../../lib/utils/actionOnActionKeys";

export const initiateUpdateController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let { scenario, update_target, transactionId } = req.body;
		let ts = new Date();
		const on_confirm = await redisFetchToServer(
			ON_ACTION_KEY.ON_CONFIRM,
			transactionId
		);
		if (!on_confirm) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED);
		}
		on_confirm.context.bpp_uri = AGRI_BPP_MOCKSERVER_URL;
		// update_target = update_target ? update_target : "payments"

		let { context, message } = on_confirm;
		const timestamp = new Date().toISOString();
		context.action = "update";
		context.timestamp = timestamp;
		let responseMessage: any;
		// Need to reconstruct this logic

		scenario = update_target ? update_target : "reject";
		console.log("scenario", scenario);

		switch (scenario) {
			case "liquidate":
				responseMessage = updateliquidateController(message, update_target);
				break;
			default:
				responseMessage = updateReject(message, update_target);
				break;
		}

		const update = {
			context,
			message: responseMessage,
		};

		const header = await createAuthHeader(update);
		await send_response(
			res,
			next,
			update,
			transactionId,
			ACTTION_KEY.UPDATE,
			(scenario = scenario)
		);
	} catch (error) {
		return next(error);
	}
};

function updateReject(message: any, update_target: string) {
	const file = fs.readFileSync(
		path.join(
			AGRI_EXAMPLES_PATH,
			"update/update_return_initiated_seller_reject.yaml"
		)
	);
	const response = YAML.parse(file.toString());

	const responseMessage = {
		update_target:"items",
		order: {
			...response.value.message.order
		},
	};
	return responseMessage;
}

function updateliquidateController(message: any, update_target: string) {
	const file = fs.readFileSync(
		path.join(
			AGRI_EXAMPLES_PATH,
			"update/update_return_initiated_seller_liquidates.yaml"
		)
	);
	const response = YAML.parse(file.toString());

	const responseMessage = {
		update_target:"items",
		order: {
			...response.value.message.order
		},
	};
	return responseMessage;
}


