import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
    AGRI_EXAMPLES_PATH,
	quoteCreatorHealthCareService,
	quoteCreatorService,
	redisFetchToServer,
	responseBuilder,
	send_nack,
	updateFulfillments,
} from "../../../lib/utils";
import fs from "fs";
import YAML from "yaml";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import {
	FULFILLMENT_LABELS,
	FULFILLMENT_STATES,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";
import path from "path";

export const updateController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let { scenario } = req.query;
		scenario=scenario?scenario:"reject"

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

		const providersItems = on_search?.message?.catalog?.['bpp/providers'][0];
		req.body.providersItems = providersItems;

		//UPDATE FULFILLMENTS HERE BECAUSE It IS SAME FOR ALL SACENRIOS
		const updatedFulfillments = updateFulfillments(
			req?.body?.message?.order?.fulfillments,
			ON_ACTION_KEY?.ON_UPDATE
		);
		req.body.message.order.fulfillments = updatedFulfillments;
		req.body.on_confirm = on_confirm;
		console.log("scenario",scenario)
		switch (scenario) {
			case "liquidate":
				updateliquidateController(req, res, next);
				break;
			case "reject":
				updateRejectController(req, res, next);
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
		const file = fs.readFileSync(
			path.join(
				AGRI_EXAMPLES_PATH,
				"on_update/on_update_status.yaml"
			)
		);
		const response = YAML.parse(file.toString());
		
		const responseMessages = {
			order: {
				...response.value.message.order			
			},
		};
		console.log("responseatUpdateBpp",JSON.stringify(responseMessages))
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
			"agri"
		);
	} catch (error) {
		next(error);
	}
};

//HANDLE UPDATE PAYMENTS AFTER ITEMS UPDATE
export const updateRejectController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, on_confirm } = req.body;
		//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS
		const file = fs.readFileSync(
			path.join(
				AGRI_EXAMPLES_PATH,
				"on_update/on_update_return_initiated_seller_reject.json.yaml"
			)
		);
		const response = YAML.parse(file.toString());
		
		const responseMessages = {
			order: {
				...response.value.message.order			
			},
		};
		console.log("responseatUpdateBpp",JSON.stringify(responseMessages))
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
			"agri"
		);
	} catch (error) {
		next(error);
	}
};

export const updateliquidateController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { context, message, on_confirm } = req.body;
		//CREATED COMMON RESPONSE MESSAGE FOR ALL SCENRIO AND UPDATE ACCORDENGLY IN FUNCTIONS
		const file = fs.readFileSync(
			path.join(
				AGRI_EXAMPLES_PATH,
				"on_update/on_update_return_initiated_seller_liquidates.json.yaml"
			)
		);
		const response = YAML.parse(file.toString());
		
		const responseMessages = {
			order: {
				...response.value.message.order			
			},
		};
		console.log("responseatUpdateBpp",JSON.stringify(responseMessages))
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
			"agri"
		);
	} catch (error) {
		next(error);
	}

};
