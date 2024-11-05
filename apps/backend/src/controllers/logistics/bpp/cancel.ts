import { NextFunction, Request, Response } from "express";
import {
	responseBuilder,
	send_nack,
	LOGISTICS_EXAMPLES_PATH,
	redis,
	Stop,
	Fulfillment,
	Item,
	redisFetchFromServer,
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";

interface Item_payment_id {
	[key: string]: string[];
}
export const cancelController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const sandboxMode = res.getHeader("mode") === "sandbox";

	if (!sandboxMode) {
		try {
			const domain = req.body.context.domain;
			let response;
			switch (domain) {
				case "ONDC:LOG10":
					var file = fs.readFileSync(
						path.join(
							LOGISTICS_EXAMPLES_PATH,
							"/B2B_Dom_Logistics_yaml/on_cancel/on_cancel.yaml"
						)
					);
					response = YAML.parse(file.toString());
					break;
				case "ONDC:LOG11":
					var file = fs.readFileSync(
						path.join(
							LOGISTICS_EXAMPLES_PATH,
							"/B2B_Int_Logistics_yaml/on_cancel/on_cancel.yaml"
						)
					);
					response = YAML.parse(file.toString());
					break;
				default:
					var file = fs.readFileSync(
						path.join(
							LOGISTICS_EXAMPLES_PATH,
							"/B2B_Dom_Logistics_yaml/on_cancel/on_cancel.yaml"
						)
					);
					response = YAML.parse(file.toString());
					break;
			}

			return responseBuilder(
				res,
				next,
				response.value.context,
				response.value.message,
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/") ? "on_cancel" : "/on_cancel"
				}`,
				`on_cancel`,
				"logistics"
			);
		} catch (error) {
			return next(error);
		}
	} else {
		try {
			const transaction_id = req.body.context.transaction_id;
			var on_confirm = await redisFetchFromServer("on_confirm", transaction_id);
			var on_update = await redisFetchFromServer("on_update", transaction_id);
			if (!on_confirm) {
				return send_nack(res, "On Confirm doesn't exist");
			}
			// getting on_search data for payment_ids
			const search = await redis.mget(
				`${transaction_id}-on_search-from-server`
			);
			const parsedSearch = search.map((ele: any) => {
				return JSON.parse(ele as string);
			});

			const provider_id = on_confirm.message.order.provider.id;

			const item_payment_ids =
				parsedSearch[0].request.message.catalog.providers.map((itm: any) => {
					if (itm.id === provider_id) {
						const result = itm.items.reduce(
							(accumulator: Item_payment_id, currentItem: any) => {
								accumulator[currentItem.id] = currentItem.payment_ids;
								return accumulator;
							},
							{}
						);
						return result;
					}
				});

			if (!item_payment_ids) {
				return send_nack(res, "Payment and Provider ID related mismatch");
			}

			if (on_confirm.message.order.id != req.body.message.order_id) {
				return send_nack(res, "Order id does not exist");
			}

			// console.log("Items with there ids :", item_payment_ids[0])
			return cancelRequest(
				req,
				res,
				next,
				on_confirm,
				on_update,
				item_payment_ids[0]
			);
		} catch (error) {
			return next(error);
		}
	}
};

const cancelRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
	transaction: any,
	on_update: any,
	item_payment_ids: Item_payment_id
) => {
	try {
		// const { message } = transaction
		const { context } = req.body;
		var responseMessage;
		if (on_update == null) {
			responseMessage = {
				...transaction.message,
				order: {
					...transaction.message.order,
					status: "Cancelled",
					cancellation: {
						cancelled_by: req.body.context.bap_id,
						reason: {
							id: req.body.message.cancellation_reason_id,
						},
					},
					fulfillments: transaction.message.order.fulfillments.map(
						(fulfillment: Fulfillment) => ({
							...fulfillment,
							state: {
								...fulfillment.state,
								descriptor: {
									code: "Cancelled",
								},
							},
							stops: fulfillment.stops.map((stop: Stop) => {
								// Add the instructions to both start and end stops
								const instructions = {
									name: "Proof of pickup",
									short_desc: "Proof of pickup details",
									long_desc: "Proof of pickup details",
									images: ["https://image1_url.png"],
								};
								// Check if the stop type is "end"
								if (stop.type === "end") {
									// Add the agent object to the stop
									return {
										...stop,
										instructions: {
											...instructions,
											name: "Proof of delivery",
											short_desc: "Proof of delivery details",
											long_desc: "Proof of delivery details",
										},
										location: {
											...stop.location,
										},
										agent: {
											person: {
												name: "Ramu",
											},
											contact: {
												phone: "9886098860",
											},
										},
									};
								} else if (stop.type === "start") {
									// For stops of type "start", add the instructions and location modifications
									return {
										...stop,
										instructions,
										location: {
											...stop.location,
											descriptor: {
												...stop.location?.descriptor,
												images: ["https://gf-integration/images/5.png"],
											},
										},
									};
								} else {
									// For other types, return the stop as is with instructions
									return {
										...stop,
										instructions,
									};
								}
							}),
						})
					),
					items: transaction.message.order.items.map((itm: Item) => ({
						...itm,
						payment_ids:
							item_payment_ids && item_payment_ids[itm.id]
								? item_payment_ids[itm.id]
								: undefined,
					})),
				},
			};
		} else {
			responseMessage = {
				...on_update.message,
				order: {
					...on_update.message.order,
					status: "Cancelled",
					cancellation: {
						cancelled_by: req.body.context.bap_id,
						reason: {
							id: req.body.message.cancellation_reason_id,
						},
					},
					fulfillments: on_update.message.order.fulfillments.map(
						(fulfillment: Fulfillment) => ({
							...fulfillment,
							state: {
								...fulfillment.state,
								descriptor: {
									code: "Cancelled",
								},
							},
							stops: fulfillment.stops.map((stop: Stop) => {
								// Add the instructions to both start and end stops
								const instructions = {
									name: "Proof of pickup",
									short_desc: "Proof of pickup details",
									long_desc: "Proof of pickup details",
									images: ["https://image1_url.png"],
								};
								// Check if the stop type is "end"
								if (stop.type === "end") {
									// Add the agent object to the stop
									return {
										...stop,
										instructions: {
											...instructions,
											name: "Proof of delivery",
											short_desc: "Proof of delivery details",
											long_desc: "Proof of delivery details",
										},
										location: {
											...stop.location,
										},
										agent: {
											person: {
												name: "Ramu",
											},
											contact: {
												phone: "9886098860",
											},
										},
									};
								} else if (stop.type === "start") {
									// For stops of type "start", add the instructions and location modifications
									return {
										...stop,
										instructions,
										location: {
											...stop.location,
											descriptor: {
												...stop.location?.descriptor,
												images: ["https://gf-integration/images/5.png"],
											},
										},
									};
								} else {
									// For other types, return the stop as is with instructions
									return {
										...stop,
										instructions,
									};
								}
							}),
						})
					),
					items: on_update.message.order.items.map((itm: Item) => ({
						...itm,
						payment_ids:
							item_payment_ids && item_payment_ids[itm.id]
								? item_payment_ids[itm.id]
								: undefined,
					})),
				},
			};
		}

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_cancel" : "/on_cancel"
			}`,
			`on_cancel`,
			"logistics"
		);
	} catch (error) {
		next(error);
	}
};
