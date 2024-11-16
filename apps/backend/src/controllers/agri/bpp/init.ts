import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	responseBuilder,
	send_nack,
	redisFetchFromServer,
	updateFulfillments,
	AGRI_EXAMPLES_PATH,
	quoteCreatorAgri,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import {
	PAYMENT_TYPE,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";

export const initController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transaction_id } = req.body.context;
		const { scenario } = req.query;
		const on_search = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SEARCH,
			transaction_id
		);
		if (!on_search) {
			return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
		}
		const providersItems =
			on_search?.message?.catalog["bpp/providers"][0]?.items;
		req.body.providersItems = providersItems;

		const on_select = await redisFetchFromServer(
			ON_ACTION_KEY.ON_SELECT,
			transaction_id
		);

		if (on_select && on_select?.error) {
			return send_nack(
				res,
				on_select?.error?.message
					? on_select?.error?.message
					: ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED
			);
		}
		if (!on_select) {
			return send_nack(res, ERROR_MESSAGES.ON_SELECT_DOES_NOT_EXISTED);
		}

		return initConsultationController(req, res, next);
	} catch (error) {
		return next(error);
	}
};

const initConsultationController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			context,
			providersItems,
			message: {
				order: { provider, items, billing, fulfillments, payments },
			},
		} = req.body;

		let file: any = fs.readFileSync(
			path.join(AGRI_EXAMPLES_PATH, "on_init/on_init.yaml")
		);
		const domain = context?.domain;
		const { locations, ...remainingProvider } = provider;

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT,
			"",
			"agri_input"
		);

		const response = YAML.parse(file.toString());

		const quoteData = quoteCreatorAgri(items, providersItems);
		const responseMessage = {
			order: {
				provider,
				locations,
				items,
				billing,
				fulfillments: updatedFulfillments,
				quote: quoteData,
				cancellation_terms: response?.value?.message?.order?.cancellation_terms,
				tags: [
					{
						code: "bpp_terms",
						list: [
							{
								code: "tax_number",
								value: "12EEEHG7876H2KJ",
							},
						],
					},
				],
				//UPDATE PAYMENT OBJECT WITH REFUNDABLE SECURITY
				payment: {
					type: "ON-FULFILLMENT",
					status: "NOT-PAID",
					"@ondc/org/settlement_basis": "delivery",
					"@ondc/org/settlement_window": "P7D",
					"@ondc/org/withholding_amount": "0.0",
					"@ondc/org/buyer_app_finder_fee_type": "percent",
					"@ondc/org/buyer_app_finder_fee_amount": "3",
				},
			},
		};
		delete req.body?.providersItems;
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_INIT
					: `/${ON_ACTION_KEY.ON_INIT}`
			}`,
			`${ON_ACTION_KEY.ON_INIT}`,
			"agri"
		);
	} catch (error) {
		next(error);
	}
};
