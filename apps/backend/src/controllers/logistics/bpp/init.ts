import { NextFunction, Request, Response } from "express";
import {
	responseBuilder,
	LOGISTICS_EXAMPLES_PATH
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";

interface Item_id_name {
	[key: string]: string;
}

export const initController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { scenario } = req.query;
	
	const sandboxMode = res.getHeader("mode") === "sandbox";

	if (!sandboxMode) {
		try {
			const domain = req.body.context.domain;

			let onInit;
			let file;
			switch (domain) {
				case "ONDC:LOG10":
					file = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_init/"
					);

					break;
				case "ONDC:LOG11":
					file = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Int_Logistics_yaml/on_init/"
					);

					break;
				default:
					file = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_init/"
					);

					break;
			}
			switch (scenario) {
				case "success":
					const successPath = path.join(file, "on_init_air_kyc_success.yaml");
					if (fs.existsSync(successPath)) {
						file = successPath;
						break;
					}
				// If the file does not exist, do not break; instead, continue to the default case
				default:
					file = path.join(file, "on_init_air_kyc_success.yaml");
			}
			if (!file) {
				return null; // Return null or handle this case as needed
			}
			const fileContent = fs.readFileSync(file, "utf8");
			onInit = YAML.parse(fileContent);
			return responseBuilder(
				res,
				next,
				onInit.value.context,
				onInit.value.message,
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/") ? "on_init" : "/on_init"
				}`,
				`on_init`,
				"logistics",
				onInit.value.error ? onInit.value.error : undefined
			);
		} catch (error) {
			next(error);
		}
	} else {
		try {
			var context = req.body.context;
			var newTime = new Date().toISOString();
			let onInit = {
				context: {
					...context,
					timestamp: newTime,
					action: "on_init",
				},
				message: {
					order: {
						provider: req.body.message.order.provider,
						items: [
							{
								id: req.body.message.order.items[0].id,
								category_ids: req.body.message.order.items[0].category_ids,
								fulfillment_ids:
									req.body.message.order.items[0].fulfillment_ids,
								time: req.body.message.order.items[0].time,
							},
						],
						fulfillments: req.body.message.order.fulfillments,
						billing: req.body.message.order.billing,
						quote: {
							price: {
								currency: "INR",
								value: "6000.0",
							},
							breakup: [
								{
									item: {
										id: req.body.message.order.items[0].id,
									},
									title: "delivery",
									price: {
										currency: "INR",
										value: "5000.0",
									},
								},
								{
									item: {
										id: req.body.message.order.items[0].id,
									},
									title: "tax",
									price: {
										currency: "INR",
										value: "500.0",
									},
								},
								{
									item: {
										id: req.body.message.order.items[0].id,
									},
									title: "insurance",
									price: {
										currency: "INR",
										value: "480.0",
									},
								},
							],
							ttl: "PT15M",
						},
						cancellation_terms: [
							{
								fulfillment_state: {
									descriptor: {
										code: "Pending",
										short_desc: "",
									},
								},
								reason_required: false,
								cancellation_fee: {
									amount: {
										currency: "INR",
										value: "0.0",
									},
								},
							},
							{
								fulfillment_state: {
									descriptor: {
										code: "Out-for-pickup",
										short_desc: "",
									},
								},
								reason_required: false,
								cancellation_fee: {
									amount: {
										currency: "INR",
										value: "500.00",
									},
								},
							},
							{
								fulfillment_state: {
									descriptor: {
										code: "In-transit",
										short_desc: "",
									},
								},
								reason_required: false,
								cancellation_fee: {
									amount: {
										currency: "INR",
										value: "700.00",
									},
								},
							},
							{
								fulfillment_state: {
									descriptor: {
										code: "At-destination-hub",
										short_desc: "",
									},
								},
								reason_required: false,
								cancellation_fee: {
									amount: {
										currency: "INR",
										value: "1000.00",
									},
								},
							},
							{
								fulfillment_state: {
									descriptor: {
										code: "Out-for-delivery",
										short_desc: "",
									},
								},
								reason_required: false,
								cancellation_fee: {
									amount: {
										currency: "INR",
										value: "4000.00",
									},
								},
							},
						],
						payments: [
							{
								id: "P1",
								collected_by: req.body.message.order.payments.collected_by,
								params: {
									amount: "6000",
									currency: "INR",
									bank_account_number: "xxxxxxxx",
									virtual_payment_address: "xxx@xxxx",
								},
								type: req.body.message.order.payments.type,
								tags: req.body.message.order.payments.tags,
							},
						],
						xinput: {
							...req.body.message.order.xinput,
							form: {
								...req.body.message.order.xinput.form,
								status: "success",
							},
						},
						tags: [
							{
								code: "BPP_Terms",
								list: [
									{
										code: "Max_Liability",
										value: "2",
									},
									{
										code: "Max_Liability_Cap",
										value: "10000",
									},
									{
										code: "Mandatory_Arbitration",
										value: "false",
									},
									{
										code: "Court_Jurisdiction",
										value: "Bengaluru",
									},
									{
										code: "Delay_Interest",
										value: "1000",
									},
									{
										code: "Static_Terms",
										value:
											"https://github.com/ONDC-Official/protocol-network-extension/discussions/79",
									},
								],
							},
						],
					},
				},
			};
			return responseBuilder(
				res,
				next,
				onInit.context,
				onInit.message,
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/") ? "on_init" : "/on_init"
				}`,
				`on_init`,
				"logistics"
			);
		} catch (error) {
			next(error);
		}
	}
};
