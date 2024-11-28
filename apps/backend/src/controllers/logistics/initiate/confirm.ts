import { NextFunction, Request, Response } from "express";
import {
	send_response,
	redis,
	send_nack,
	redisFetchToServer,
	redisFetchFromServer,
} from "../../../lib/utils";

import { v4 as uuidv4 } from "uuid";

export const initiateConfirmController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transactionId } = req.body;
		var transactionKeys = await redis.keys(`${transactionId}-*`);
		var ifTransactionExist = transactionKeys.filter(
			(e) =>
				e.includes("on_init-from-server") || e.includes("on_init-to-server")
		);
		if (ifTransactionExist.length === 0) {
			return send_nack(res, "On Init doesn't exist");
		}
		var transaction = await redisFetchToServer("on_init", transactionId);
		const onInit = transaction;
		if (Object.keys(onInit).includes("error")) {
			return send_nack(res, "On Init had errors");
		}
		transactionKeys = await redis.keys(`${transactionId}-*`);
		// ifTransactionExist = transactionKeys.filter((e) =>
		// 	e.includes("init-to-server")
		// );
		// if (ifTransactionExist.length === 0) {
		// 	return send_nack(res, "Init doesn't exist");
		// }
		transaction = await redisFetchFromServer("init", transactionId);
		// parsedTransaction = transaction.map((ele) => {
		// 	return JSON.parse(ele as string);
		// });

		// const initTransaction = parsedTransaction.find(
		// 	(tx) => tx?.request?.context && tx?.request?.context?.action === 'init'
		// );
		const Init = transaction;
		if (Object.keys(Init).includes("error")) {
			return send_nack(res, "Init had errors");
		}
		var newTime = new Date().toISOString();
		const confirmProvider = {
			...Init.message.order.provider,
			locations:
				Init.message.order.provider.locations.map((e: any) => {
					return { id: e.id };
				}) ?? [],
		};
		console.log("🚀 ~ confirmProvider:", confirmProvider);
		const confirmItems = Init.message.order.items.map((e: any) => {
			return {
				id: e.id,
				fulfillment_ids: e.fulfillment_ids,
				category_ids: e.category_ids,
				descriptor: e.descriptor,
			};
		});
		const confirmFulfillments = [
			{
				...Init.message.order.fulfillments[0],
				stops: Init.message.order.fulfillments[0]?.stops.map((e: any) => {
					return {
						...e,
						id: "L1",
						parent_stop_id: "",
					};
				}),
				agent: {
					person: {
						name: "Ramu",
					},
				},
				customer: {
					person: {
						name: "xyz",
					},
					contact: {
						phone: "9886098860",
						email: "xyz.efgh@gmail.com",
					},
				},
				tags: [
					{
						descriptor: {
							code: "Delivery_Terms",
						},
						list: [
							{
								descriptor: {
									code: "RTO_Action",
								},
								value: "no",
							},
						],
					},
				],
			},
		];
		let confirm = {
			context: {
				...Init.context,
				timestamp: newTime,
				action: "confirm",
				message_id: uuidv4(),
			},
			message: {
				order: {
					id: "O2",
					status: "Created",
					provider: confirmProvider,
					items: confirmItems,
					fulfillments: confirmFulfillments,
					quote: onInit.message.order.quote,
					billing: Init.message.order.billing,
					payments: onInit.message.order.payments,
					tags: [
						{
							descriptor: {
								code: "Package_Weight",
							},
							list: [
								{
									descriptor: {
										code: "Unit",
									},
									value: "kilogram",
								},
								{
									descriptor: {
										code: "Value",
									},
									value: "5",
								},
							],
						},
						{
							descriptor: {
								code: "Package_Dimensions",
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
									value: "100",
								},
								{
									descriptor: {
										code: "Breadth",
									},
									value: "100",
								},
								{
									descriptor: {
										code: "Height",
									},
									value: "100",
								},
								{
									descriptor: {
										code: "Count",
									},
									value: "10",
								},
							],
						},
						{
							descriptor: {
								code: "Package_Dimensions",
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
									value: "100",
								},
								{
									descriptor: {
										code: "Breadth",
									},
									value: "100",
								},
								{
									descriptor: {
										code: "Height",
									},
									value: "100",
								},
								{
									descriptor: {
										code: "Count",
									},
									value: "5",
								},
							],
						},
						{
							descriptor: {
								code: "Package_Details",
							},
							list: [
								{
									descriptor: {
										code: "Category",
									},
									value: "Grocery",
								},
								{
									descriptor: {
										code: "Dangerous_Goods",
									},
									value: "true",
								},
								{
									descriptor: {
										code: "Stackable",
									},
									value: "true",
								},
								{
									descriptor: {
										code: "Shipment_Value",
									},
									value: "50000",
								},
							],
						},
						{
							descriptor: {
								code: "Cold_Logistics",
							},
							list: [
								{
									descriptor: {
										code: "Temp_Control",
									},
									value: "true",
								},
								{
									descriptor: {
										code: "Temp_Unit",
									},
									value: "Celsius",
								},
								{
									descriptor: {
										code: "Temp_Min",
									},
									value: "0",
								},
								{
									descriptor: {
										code: "Temp_Max",
									},
									value: "4",
								},
							],
						},
					],
					created_at: newTime,
					updated_at: newTime,
				},
			},
		};

		await send_response(res, next, confirm, transactionId, "confirm");
	} catch (error) {
		return next(error);
	}
};
