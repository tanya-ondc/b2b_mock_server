import { NextFunction, Request, Response } from "express";
import { redisFetchFromServer } from "../../lib/utils";
import { Fulfillment, Item } from "../../lib/utils";
export const getCatalogController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const transaction_id = req.body.transactionId;
		const response = await redisFetchFromServer("on_search", transaction_id);
		const { context, message } = response;

		// Ensure message and fulfillments are valid
		if (!message || !message.catalog.fulfillments) {
			throw new Error("Invalid response structure");
		}

		const deliveryFulfillment = message.catalog.fulfillments.find(
			(fulfillment: Fulfillment) => fulfillment.type === "Delivery"
		);
		if (!deliveryFulfillment) {
			throw new Error("Delivery fulfillment not found");
		}
		const deliveryFulfillmentId = deliveryFulfillment.id;
		const matchingItems = message.catalog.providers[0].items.filter(
			(item: Item) => item.fulfillment_ids[0] === deliveryFulfillmentId
		);
		console.log(matchingItems);
		return res.status(200).json({
      message: {
        matchingItems,
      }
    })
	} catch (error) {
		return next(error);
	}
};
