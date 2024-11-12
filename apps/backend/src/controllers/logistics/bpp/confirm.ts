import { NextFunction, Request, Response } from "express";
import {
	responseBuilder,
	LOGISTICS_EXAMPLES_PATH,
	redis,
	send_nack,
	Stop,
	redisFetchToServer,
	redisFetchFromServer,
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";

export const confirmController = async (
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
							"/B2B_Dom_Logistics_yaml/on_confirm/on_confirm_air.yaml"
						)
					);
					response = YAML.parse(file.toString());
					break;
				case "ONDC:LOG11":
					var file = fs.readFileSync(
						path.join(
							LOGISTICS_EXAMPLES_PATH,
							"/B2B_Int_Logistics_yaml/on_confirm/on_confirm_air.yaml"
						)
					);
					response = YAML.parse(file.toString());
					break;
				default:
					var file = fs.readFileSync(
						path.join(
							LOGISTICS_EXAMPLES_PATH,
							"/B2B_Dom_Logistics_yaml/on_confirm/on_confirm_air.yaml"
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
					req.body.context.bap_uri.endsWith("/") ? "on_confirm" : "/on_confirm"
				}`,
				`on_confirm`,
				"logistics"
			);
		} catch (error) {
			return next(error);
		}
	} else {

		const transactionId = req.body.context.transaction_id;
		var transactionKeys = await redis.keys(`${transactionId}-*`);
		var ifTransactionExist = transactionKeys.filter((e) =>
			e.includes("on_init-from-server")
	);
	console.log("🚀 ~ ifTransactionExist:", ifTransactionExist)
		if (ifTransactionExist.length === 0) {
			return send_nack(res, "On Init doesn't exist");
		}
		var transaction = await redisFetchFromServer("on_init",transactionId)
		// var parsedTransaction = transaction.map((ele) => {
		// 	return JSON.parse(ele as string);
		// });

		const onInit = transaction;
		if (Object.keys(onInit).includes("error")) {
			return send_nack(res, "On Init had errors");
		}
		let startstartDate = new Date();
		startstartDate.toISOString();
		let startendDate = new Date();
		startendDate.setMinutes(startstartDate.getDate() + 30);
		let endstartDate = new Date();
		endstartDate.setDate(startstartDate.getDate() + 7);
		let endendDate = new Date();
		endendDate.setMinutes(startstartDate.getDate() + 30); 
		var newTime = new Date().toISOString();
		let onConfirm = {
			context: {
				...req.body.context,
				timestamp: newTime,
				action: "on_confirm",
			},
			message: {
				order: {
					id: "O2",
					status: "Accepted",
					provider: req.body.message.order.provider,
					items: req.body.message.order.items,
					quote: req.body.message.order.quote,
					fulfillments: [
						{
							...req.body.message.order.fulfillments[0],
							state: {
								descriptor: {
									code: "Pending",
								},
							},
							tracking: false,
							stops: req.body.message.order.fulfillments[0].stops.map(
								(stop: Stop) => {
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
											id: "L2",
											parent_stop_id: "L1",
											time: {
												range: {
													start: endstartDate,
													end: endendDate.toISOString(),
												},
											},
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
											id: "L1",
											parent_stop_id: "",
											instructions,
											time: {
												range: {
													start: startstartDate,
													end: startendDate.toISOString(),
												},
											},
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
								}
							),
							tags: [
								{
									descriptor: {
										code: "Delivery_Terms",
									},
									list: [
										{
											descriptor: {
												code: "AWB_No",
											},
											value: "1209878992826353",
										},
										{
											descriptor: {
												code: "LR_No",
											},
											value: "1209878992826353",
										},
										{
											descriptor: {
												code: "Transporter_Id",
											},
											value: "1209878992826353",
										},
										{
											descriptor: {
												code: "Doc_Way_Bill_No",
											},
											value: "1209567899003",
										},
									],
								},
							],
						},
					],
					cancellation_terms: onInit.message.order.cancellation_terms,
					billing: req.body.message.order.billing,
					payments: req.body.message.order.payments,
					tags: req.body.message.order.tags,
					created_at: req.body.message.order.created_at,
					updated_at: newTime,
				},
			},
		};

		return responseBuilder(
			res,
			next,
			onConfirm.context,
			onConfirm.message,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_confirm" : "/on_confirm"
			}`,
			`on_confirm`,
			"logistics"
		);
	}
};
