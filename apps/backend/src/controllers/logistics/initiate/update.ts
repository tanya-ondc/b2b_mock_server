import { NextFunction, Request, Response } from "express";
import {
	send_response,
	send_nack,
	redisFetchFromServer,
	redisFetchToServer,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";


export const initiateUpdateController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {  transactionId } = req.body;
		const onConfirm = await redisFetchToServer("on_confirm", transactionId);
		if (!onConfirm) {
			return send_nack(res, "On Confirm doesn't exist");
		}
		let newTime = new Date().toISOString();
		let update = {
			context: {
				...onConfirm.context,
				action: "update",
				message_id: uuidv4(),
				timestamp: newTime,
			},
			message: {
				update_target: "fulfillment",
				order: {
					id: onConfirm.message.order.id,
					status: onConfirm.message.order.status,
					provider: onConfirm.message.order.provider,
					items: onConfirm.message.order.items,
					fulfillments: [
						{
							id: "1",
							type: "Delivery",
							state: {
								descriptor: {
									code: "Pending",
								},
							},
							tracking: false,
							stops: [
								{
									id: "L1",
									parent_stop_id: "",
									type: "start",
									instructions: {
										code: "AWB_No",
										short_desc: "value of PCC",
										long_desc: "QR code will be attached to package",
										additional_desc: {
											content_type: "text/html",
											url: "https://shipping/label/image.htm",
										},
									},
									authorization: {
										type: "QR",
										token: "XYZ2",
										valid_from: "",
										valid_to: "",
									},
								},
								{
									id: "L2",
									parent_stop_id: "L1",
									type: "end",
									authorization: {
										type: "QR",
										token: "XYZ2",
										valid_from: "",
										valid_to: "",
									},
									instructions: {
										short_desc: "",
										long_desc: "drop package at security gate",
										additional_desc: {
											content_type: "text/html",
											url: "URL for instructions",
										},
									},
								},
							],
							tags: [
								{
									descriptor: {
										code: "Delivery_Terms",
									},
									list: [
										{
											descriptor: {
												code: "Ready_To_Ship",
											},
											value: "yes",
										},
										{
											descriptor: {
												code: "AWB_No",
											},
											value: "1227262193237777",
										},
										{
											descriptor: {
												code: "Eway_Bill_No",
											},
											value: "1227262193237777",
										},
									],
								},
							],
						},
					],
					tags: onConfirm.message.order.tags,
					updated_at: newTime,
				},
			},
		};
    await send_response(res, next, update, transactionId, "update");
	} catch (error) {
		return next(error);
	}
};
