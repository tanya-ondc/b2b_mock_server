import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	send_response,
	redis,
	send_nack,
	Item,
	redisFetchFromServer,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";

export const initiateInitController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { transactionId } = req.body;
		const transactionKeys = await redis.keys(`${transactionId}-*`);
		const ifTransactionExist = transactionKeys.filter(
			(e) =>
				e.includes("on_search-from-server") || e.includes("on_search-to-server")
		);
		if (ifTransactionExist.length === 0) {
			return send_nack(res, "On Search doesn't exist");
		}
		const searchreq = await redisFetchFromServer("search", transactionId)


		const transaction = await redis.mget(ifTransactionExist);
		const parsedTransaction = transaction.map((ele) => {
			return JSON.parse(ele as string);
		});

		const request = parsedTransaction[0].request;
		if (Object.keys(request).includes("error")) {
			return send_nack(res, "On Search had errors");
		}
		let init;
		const providers = request.message.catalog.providers;
		const items: Item[] = providers[0].items;
		const selectedItem = items.find((item) => item.id === req.body.itemID);

		if (!selectedItem) {
			return send_nack(res, "No items available.");
		}
		var newTime = new Date().toISOString();
		const locations = {
			startLocation: searchreq.message.intent.fulfillment.stops.find((e: any) => e.type == "start"),
			endLocation: searchreq.message.intent.fulfillment.stops.find((e: any) => e.type == "end")
		}

		init = {
			context: {
				...request.context,
				action: "init",
				bpp_id: MOCKSERVER_ID,
				timestamp: newTime,
				message_id: uuidv4(),
			},
			message: {
				order: {
					provider: {
						id: providers[0].id,
						locations: providers[0].locations,
					},
					items: [
						{
							id: selectedItem.id,
							category_ids: selectedItem.category_ids,
							fulfillment_ids: selectedItem.fulfillment_ids,
							descriptor: {
								code: selectedItem.descriptor?.code,
							},
							time: {
								label: selectedItem.time?.label,
								duration: selectedItem.time?.duration,
							},
						},
					],
					fulfillments: [
						{
							id: "1",
							type: "Delivery",
							stops: [
								{
									type: "start",
									location: {
										...locations.startLocation.location,
										address: "My building #, My street name",
										city: {
											name: "Bengaluru",
										},
										state: {
											name: "Karnataka",
										},
										country: {
											code: "IND",
										},
									},
									contact: {
										phone: "9886098860",
										email: "abcd.efgh@gmail.com",
									},
								},
								{
									type: "end",
									location: {
										...locations.endLocation.location,
										address: "My house or building name, street name",
										city: {
											name: "Bengaluru",
										},
										state: {
											name: "Karnataka",
										},
										country: {
											code: "IND",
										},
									},
									contact: {
										phone: "9886098860",
										email: "abcd.efgh@gmail.com",
									},
								},
							],
						},
					],
					billing: {
						name: "ONDC sellerapp",
						address: "My house or building name",
						city: "Bengaluru",
						state: "Karnataka",
						tax_id: "XXXXXXXXXXXXXXX",
						phone: "9886098860",
						email: "abcd.efgh@gmail.com",
						time: {
							timestamp: newTime,
						},
					},
					payments: [
						{
							collected_by: "BPP",
							type: "ON-FULFILLMENT",
							tags: [
								{
									descriptor: {
										code: "Settlement_Details",
									},
									list: [
										{
											descriptor: {
												code: "Counterparty",
											},
											value: "BAP",
										},
										{
											descriptor: {
												code: "Mode",
											},
											value: "UPI",
										},
										{
											descriptor: {
												code: "Beneficiary_Name",
											},
											value: "xxxxx",
										},
										{
											descriptor: {
												code: "Bank_Account_No",
											},
											value: "xxxxx",
										},
										{
											descriptor: {
												code: "Ifsc_Code",
											},
											value: "xxxxxxx",
										},
										{
											descriptor: {
												code: "UPI_Address",
											},
											value: "xxxxxxx",
										},
									],
								},
								{
									descriptor: {
										code: "Collection_Details",
									},
									list: [
										{
											descriptor: {
												code: "Amount",
											},
											value: "20000",
										},
										{
											descriptor: {
												code: "Type",
											},
											value: "ON-FULFILLMENT",
										},
									],
								},
							],
						},
					],
					xinput: {
						form: {
							url: "https://lsp.com/xxx/kyc",
							mime_type: "text/html",
							submission_id: "xxxx44567789999",
						},
						required: true,
					},
				},
			},
		};
		await send_response(res, next, init, transactionId, "init");
	} catch (error) {
		return next(error);
	}
};
