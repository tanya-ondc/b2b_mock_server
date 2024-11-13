import { NextFunction, Request, Response } from "express";
import {
	send_nack,
	redis,
	responseBuilder,
	LOGISTICS_EXAMPLES_PATH,
	Item,
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";

function getRandomFile(directory: string): string | null {
	const files = fs.readdirSync(directory);
	const yamlFiles = files.filter((file) => file.endsWith(".yaml"));

	if (yamlFiles.length === 0) {
		console.error(`No YAML files found in directory: ${directory}`);
		return null;
	}

	const randomIndex = Math.floor(Math.random() * yamlFiles.length);

	return path.join(directory, yamlFiles[randomIndex]);
}

export const updateController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { scenario } = req.query;
	const sandboxMode = res.getHeader("mode") === "sandbox";
	if (!sandboxMode) {
		try {
			const domain = req.body.context.domain;
			let directory: string;

			// Determine the directory based on the domain
			switch (domain) {
				case "ONDC:LOG10":
					directory = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_update"
					);
					break;

				case "ONDC:LOG11":
					directory = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Int_Logistics_yaml/on_update"
					);
					break;

				default:
					// Fallback to the LOG10 directory if the domain is not recognized
					directory = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_update"
					);
					break;
			}

			let file;
			switch (scenario) {
				case "regular":
					file = path.join(directory, "on_update_air.yaml");
					break;
				default:
					file = path.join(directory, "on_update_air_diff.yaml");
			}
			if (!file) {
				return null; // Return null or handle this case as needed
			}

			const fileContent = fs.readFileSync(file, "utf8");
			const response = YAML.parse(fileContent);

			return responseBuilder(
				res,
				next,
				response.value.context,
				response.value.message,
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/") ? "on_update" : "/on_update"
				}`,
				`on_update`,
				"logistics"
			);
		} catch (error) {
			return next(error);
		}
	} else {
		try {
			const domain = req.body.context.domain;
			let file: string;
			// Determine the directory based on the domain
			switch (domain) {
				case "ONDC:LOG10":
					file = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_update/on_update_air_diff.yaml"
					);
					break;

				case "ONDC:LOG11":
					file = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Int_Logistics_yaml/on_update/on_update_air.yaml"
					);
					break;

				default:
					// Fallback to the LOG10 directory if the domain is not recognized
					file = path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/on_update/on_update_air_diff.yaml"
					);
					break;
			}
			const fileContent = fs.readFileSync(file, "utf8");
			var mockOnUpdate = YAML.parse(fileContent);
			const transactionId = req.body.context.transaction_id;
			var transactionKeys = await redis.keys(`${transactionId}-*`);
			var ifTransactionExist = transactionKeys.filter((e) =>
				e.includes("on_confirm-from-server")
			);
			if (ifTransactionExist.length === 0) {
				return send_nack(res, "On Confirm doesn't exist");
			}
			var transaction = await redis.mget(ifTransactionExist);
			var parsedTransaction = transaction.map((ele) => {
				return JSON.parse(ele as string);
			});
			const onConfirm = parsedTransaction[0].request;
			if (Object.keys(onConfirm).includes("error")) {
				return send_nack(res, "On Confirm had errors");
			}
			let newTime = new Date().toISOString();
			let context = {
				...req.body.context,
				action: "on_update",
				timestamp: newTime,
			};
			const updateItems: Item[] = onConfirm.message.order.items.map(
				(item: Item) => ({
					...item,
					time: {
						...item.time,
						timestamp: newTime.split("T")[0],
					},
				})
			);
			const tags = [
				...onConfirm.message.order.tags,
				{
					descriptor: {
						code: "Package_Dimensions_Diff",
					},
					list: [
						{
							descriptor: {
								code: "Unit",
							},
							value: "centimeter",
						},
						{
							descriptor: {
								code: "Length",
							},
							value: "1.5",
						},
						{
							descriptor: {
								code: "Breadth",
							},
							value: "1.5",
						},
						{
							descriptor: {
								code: "Height",
							},
							value: "1.5",
						},
					],
				},
				{
					descriptor: {
						code: "Diff_Proof",
					},
					list: [
						{
							descriptor: {
								code: "type",
							},
							value: "image",
						},
						{
							descriptor: {
								code: "url",
							},
							value: "https://xxxxx/xx.png",
						},
					],
				},
			];
			let response = {
				order: {
					id: onConfirm.message.order.id,
					status: "In-progress",
					provider: onConfirm.message.order.provider,
					items: updateItems,
					fulfillments: mockOnUpdate.value.message.order.fulfillments,
					quote: mockOnUpdate.value.message.order.quote,
					updated_at: newTime,
					billing: onConfirm.message.order.billing,
					payments: onConfirm.message.order.payments,
					tags: tags,
				},
			};
			return responseBuilder(
				res,
				next,
				context,
				response,
				`${req.body.context.bap_uri}${
					req.body.context.bap_uri.endsWith("/") ? "on_update" : "/on_update"
				}`,
				`on_update`,
				"logistics"
			);
		} catch (error) {
			return next(error);
		}
	}
};
