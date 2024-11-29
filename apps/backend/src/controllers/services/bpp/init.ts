import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	quoteCreatorHealthCareService,
	responseBuilder,
	send_nack,
	AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH,
	redisFetchFromServer,
	updateFulfillments,
	quoteCreatorService,
	SERVICES_EXAMPLES_PATH,
	HEALTHCARE_SERVICES_EXAMPLES_PATH,
	AGRI_SERVICES_EXAMPLES_PATH,
	BID_AUCTION_SERVICES_EXAMPLES_PATH,
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
		const providersItems = on_search?.message?.catalog?.providers[0]?.items;
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
		switch (scenario) {
			//EQUIPMENT HIRING
			case "availability_changes_during_the_transaction_journey":
				initItemNotAvaliableController(req, res, next);
				break;
			case "participation_fee":
				initParticipationFeeController(req, res, next);
				break;
			case "bid_placement":
				initBidPlacementController(req, res, next);
				break;
			default:
				return initConsultationController(req, res, next);
		}
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

		// console.log("ITEMS before :::::::", items)

		let file: any = fs.readFileSync(
			path.join(SERVICES_EXAMPLES_PATH, "on_init/on_init_consultation.yaml")
		);
		const domain = context?.domain;

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT,
			domain
		);

		switch (domain) {
			case SERVICES_DOMAINS.SERVICES:
				file = fs.readFileSync(
					path.join(SERVICES_EXAMPLES_PATH, "on_init/on_init_consultation.yaml")
				);
				break;
			case SERVICES_DOMAINS.AGRI_EQUIPMENT:
				file = fs.readFileSync(
					path.join(AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH, "on_init/on_init.yaml")
				);
				break;
			case SERVICES_DOMAINS.HEALTHCARE_SERVICES:
				file = fs.readFileSync(
					path.join(HEALTHCARE_SERVICES_EXAMPLES_PATH, "on_init/on_init.yaml")
				);
				break;
			case SERVICES_DOMAINS.AGRI_SERVICES:
				file = fs.readFileSync(
					path.join(AGRI_SERVICES_EXAMPLES_PATH, "on_init/on_init.yaml")
				);
				break;
			case SERVICES_DOMAINS.BID_ACTION_SERVICES:
				file = fs.readFileSync(
					path.join(BID_AUCTION_SERVICES_EXAMPLES_PATH, "on_init/on_init.yaml")
				);
				break;
			default:
				file = fs.readFileSync(
					path.join(SERVICES_EXAMPLES_PATH, "on_init/on_init_consultation.yaml")
				);
				break;
		}

		const response = YAML.parse(file.toString());

		const quoteData =
			domain === SERVICES_DOMAINS.SERVICES
				? quoteCreatorService(items, providersItems)
				: domain === SERVICES_DOMAINS.AGRI_EQUIPMENT
				? quoteCreatorHealthCareService(
						items,
						providersItems,
						"",
						fulfillments[0]?.type,
						"agri-equipment-hiring"
				  )
				: domain === SERVICES_DOMAINS.BID_ACTION_SERVICES
				? quoteCreatorHealthCareService(
						items,
						providersItems,
						"",
						fulfillments[0]?.type,
						"bid_auction_service"
				  )
				: quoteCreatorHealthCareService(
						items,
						providersItems,
						"",
						fulfillments[0]?.type
				  );
		console.log("ITEMS :::::::::::::::", items);
		const responseMessage = {
			order: {
				provider,
				items,
				billing,
				fulfillments: updatedFulfillments,
				quote: quoteData,
				cancellation_terms: response?.value?.message?.order?.cancellation_terms,
				//UPDATE PAYMENT OBJECT WITH REFUNDABLE SECURITY

				payments: [
					response?.value?.message?.order?.payments[0],
					{
						id:
							domain === SERVICES_DOMAINS.AGRI_EQUIPMENT
								? response?.value?.message?.order?.payments[1]?.id
								: response?.value?.message?.order?.payments[0]?.id,
						type: PAYMENT_TYPE.ON_FULFILLMENT,
						collected_by:
							response?.value?.message?.order?.payments[0]?.collected_by,
						params: {
							amount:
								domain === SERVICES_DOMAINS.AGRI_EQUIPMENT
									? (Number(quoteData?.price?.value) - 5000).toString()
									: Number(quoteData?.price?.value).toString(),
							currency: quoteData?.price?.currency,
							bank_account_number:
								domain === SERVICES_DOMAINS.AGRI_EQUIPMENT
									? response?.value?.message?.order?.payments[1]?.params
											?.bank_account_number
									: response?.value?.message?.order?.payments[0]?.params
											?.bank_account_number,

							virtual_payment_address:
								domain === SERVICES_DOMAINS.AGRI_EQUIPMENT
									? response?.value?.message?.order?.payments[1]?.params
											?.virtual_payment_address
									: response?.value?.message?.order?.payments[0]?.params
											?.virtual_payment_address,
						},
						tags:
							domain === SERVICES_DOMAINS.AGRI_EQUIPMENT
								? response?.value?.message?.order?.payments[1]?.tags
								: response?.value?.message?.order?.payments[0]?.tags,
					},
				],
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
			"services"
		);
	} catch (error) {
		next(error);
	}
};

const initItemNotAvaliableController = (
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

		items.forEach((item: any) => {
			// Find the corresponding item in the second array
			if (providersItems) {
				const matchingItem = providersItems.find(
					(secondItem: { id: string }) => secondItem.id === item.id
				);
				// If a matching item is found, update the price in the items array
				if (matchingItem) {
					item.time = matchingItem?.time;
				}
			}
		});

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT
		);

		const file = fs.readFileSync(
			path.join(AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH, "on_init/on_init.yaml")
		);
		const response = YAML.parse(file.toString());
		const quoteData = quoteCreatorHealthCareService(
			items,
			providersItems,
			"",
			fulfillments[0]?.type,
			"agri-equipment-hiring"
		);

		const responseMessage = {
			order: {
				provider,
				items: items.map(
					({ ...remaining }: { location_ids: any; remaining: any }) => ({
						...remaining,
					})
				),
				billing,
				fulfillments: updatedFulfillments,
				// quote: quoteData,
				payments: [
					{
						id: response?.value?.message?.order?.payments[0]?.id,
						type: payments[0]?.type,
						collected_by: payments[0]?.collected_by,
						params: {
							amount: quoteData?.price?.value,
							currency: quoteData?.price?.currency,
							bank_account_number:
								response?.value?.message?.order?.payments[0]?.params
									?.bank_account_number,
							virtual_payment_address:
								response?.value?.message?.order?.payments[0]?.params
									?.virtual_payment_address,
						},
						tags: response?.value?.message?.order?.payments[0]?.tags,
					},
				],
			},
		};

		const error = {
			code: "90002",
			message: ERROR_MESSAGES.EQUIPMENT_NOT_LONGER_AVALIABLE,
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
			"agri-equipment-hiring",
			error
		);
	} catch (error) {
		next(error);
	}
};

const initBidPlacementController = (
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

		items.forEach((item: any) => {
			// Find the corresponding item in the second array
			if (providersItems) {
				const matchingItem = providersItems.find(
					(secondItem: { id: string }) => secondItem.id === item.id
				);
				// If a matching item is found, update the price in the items array
				if (matchingItem) {
					item.time = matchingItem?.time;
				}
			}
		});

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT
		);

		const file = fs.readFileSync(
			path.join(
				BID_AUCTION_SERVICES_EXAMPLES_PATH,
				"on_init/on_init_bid_placement.yaml"
			)
		);

		const response = YAML.parse(file.toString());

		const quoteData = quoteCreatorHealthCareService(
			items,
			providersItems,
			"",
			fulfillments[0]?.type,
			"bid_auction_service",
			"bid_placement"
		);

		const responseMessage = {
			order: {
				provider,
				items: items.map(
					({ ...remaining }: { location_ids: any; remaining: any }) => ({
						...remaining,
					})
				),
				billing,
				fulfillments: updatedFulfillments,
				quote: quoteData,
				payments: [
					{
						id: response?.value?.message?.order?.payments[0]?.id,
						type: payments[0]?.type,
						collected_by: payments[0]?.collected_by,
						params: {
							amount: quoteData?.price?.value,
							currency: quoteData?.price?.currency,
							bank_account_number:
								response?.value?.message?.order?.payments[0]?.params
									?.bank_account_number,
							virtual_payment_address:
								response?.value?.message?.order?.payments[0]?.params
									?.virtual_payment_address,
						},
						tags: response?.value?.message?.order?.payments[0]?.tags,
					},
				],
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
			"services"
		);
	} catch (error) {
		next(error);
	}
};

const initParticipationFeeController = (
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

		items.forEach((item: any) => {
			// Find the corresponding item in the second array
			if (providersItems) {
				const matchingItem = providersItems.find(
					(secondItem: { id: string }) => secondItem.id === item.id
				);
				// If a matching item is found, update the price in the items array
				if (matchingItem) {
					item.time = matchingItem?.time;
				}
			}
		});

		const updatedFulfillments = updateFulfillments(
			fulfillments,
			ON_ACTION_KEY?.ON_INIT
		);

		const file = fs.readFileSync(
			path.join(
				BID_AUCTION_SERVICES_EXAMPLES_PATH,
				"on_init/on_init_bid_placement.yaml"
			)
		);

		const response = YAML.parse(file.toString());

		const quoteData = quoteCreatorHealthCareService(
			items,
			providersItems,
			"",
			fulfillments[0]?.type,
			"bid_auction_service",
			"participation_fee"
		);
		const responseMessage = {
			order: {
				provider,
				items: items.map(
					({ ...remaining }: { location_ids: any; remaining: any }) => ({
						...remaining,
					})
				),
				billing,
				fulfillments: updatedFulfillments,
				quote: quoteData,
				payments: [
					{
						id: response?.value?.message?.order?.payments[0]?.id,
						type: payments[0]?.type,
						collected_by: payments[0]?.collected_by,
						params: {
							amount: quoteData?.price?.value,
							currency: quoteData?.price?.currency,
							bank_account_number:
								response?.value?.message?.order?.payments[0]?.params
									?.bank_account_number,
							virtual_payment_address:
								response?.value?.message?.order?.payments[0]?.params
									?.virtual_payment_address,
						},
						tags: response?.value?.message?.order?.payments[0]?.tags,
					},
				],
			},
		};
		delete req.body?.providersItems;

		// console.log("responseMessage=>>>>>>>>>",responseMessage)
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
			"services"
		);
	} catch (error) {
		next(error);
	}
};
