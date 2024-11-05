import { NextFunction, Request, Response } from "express";
import {
	responseBuilder,
	redis,
	send_nack,
	Item,
	Quantity,
	Breakup,
	quoteCreatorB2c,
	quoteCreator,
} from "../../../lib/utils";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
interface Item_id_name {
	id: string;
	name: string;
	available_qty: number;
}

export const selectController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scenario, version } = req.query;
    const { transaction_id } = req.body.context;

    const transactionKeys = await redis.keys(`${transaction_id}-*`);
    const ifToTransactionExist = transactionKeys.filter((e) =>
      e.includes("on_search-to-server")
    );

    const ifFromTransactionExist = transactionKeys.filter((e) =>
      e.includes("on_search-from-server")
    );

    if (
      ifFromTransactionExist.length === 0 &&
      ifToTransactionExist.length === 0
    ) {
      return send_nack(res, ERROR_MESSAGES.ON_SEARCH_DOES_NOT_EXISTED);
    }

    const transaction = await redis.mget(
      ifFromTransactionExist.length > 0
        ? ifFromTransactionExist
        : ifToTransactionExist
    );
    const parsedTransaction = transaction.map((ele) => {
      return JSON.parse(ele as string);
    });

    const providers = parsedTransaction[0].request.message.catalog.providers;
    req.body.providersItems = providers[0];

    const item_id_name: Item_id_name[] = providers.map((pro: any) => {
      const mappedItems = pro.items.map((item: Item) => ({
        id: item.id,
        name: item.descriptor?.name,
        available_qty: (item.quantity as Quantity).available.count,
      }));
      return mappedItems;
    });
    req.body.item_arr = item_id_name.flat();

    for (const itm of req.body.message.order.items) {
      const item = req.body.item_arr.find(
        (item: Item_id_name) => item.id == itm.id
      );

      if (
        "selected" in itm.quantity &&
        itm.quantity.selected.count > item.available_qty
      ) {
        return send_nack(
          res,
          `Required Quantity for Item:${item.name} is unavailable.`
        );
      }
    }

    switch (scenario) {
      case "non-serviceable":
        return selectNonServiceableController(req, res, next);
      case "quantity-unavailable":
        return selectQuantityUnavailableController(req, res, next);
      default:
        return selectDomesticController(req, res, next);
    }
  } catch (error) {
    return next(error);
  }
};

export const selectDomesticController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { version } = req.query;
		const { context, message, providersItems } = req.body;
		const { ttl, ...provider } = message.order.provider;

		let responseMessage = {
			order: {
				provider,
				payments: [message.order.payments[0]],
				items: message.order.items.map(
					({
						location_ids,
						add_ons,
						...remaining
					}: {
						location_ids: string[];
						add_ons: any;
						remaining: any;
					}) => ({
						...remaining,
					})
				),
				fulfillments: message.order.fulfillments.map(
					({ id, ...each }: { id: string; each: any }) => ({
						id,
						tracking: false,
						"@ondc/org/provider_name": "ONDC Mock Server",
						"@ondc/org/category": "Express Delivery",
						"@ondc/org/TAT": "P7D",
						state: {
							descriptor: {
								code: "Serviceable",
							},
						},
					})
				),
				quote:
					version === "b2c"
						? quoteCreatorB2c(message?.order?.items, providersItems?.items)
						: quoteCreator(message.order.items),
			},
		};
		try {
			responseMessage.order.quote.breakup.forEach((element: Breakup) => {
				if (element["@ondc/org/title_type"] === "item") {
					const id = element["@ondc/org/item_id"];
					const item = req.body.item_arr.find(
						(item: Item_id_name) => item.id == id
					);
					element.title = item.name;
				}
			});
		} catch (error) {
			return next(error);
		}

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_select" : "/on_select"
			}`,
			`on_select`,
			"retail"
		);
	} catch (error) {
		return next(error);
	}
};

export const selectNonServiceableController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { version } = req.query;
		const { context, message, providersItems } = req.body;
		const { ttl, ...provider } = message.order.provider;

		let responseMessage = {
			order: {
				provider,
				payments: [message.order.payments[0]],
				items: message.order.items.map(
					({
						location_ids,
						add_ons,
						...remaining
					}: {
						location_ids: string[];
						add_ons: any;
						remaining: any;
					}) => ({
						...remaining,
					})
				),
				fulfillments: message.order.fulfillments.map(
					({ id, ...each }: { id: string; each: any }) => ({
						id,
						tracking: false,
						"@ondc/org/provider_name": "ONDC Mock Server",
						"@ondc/org/category": "Express Delivery",
						"@ondc/org/TAT": "P7D",
						state: {
							descriptor: {
								code: "Non-Serviceable",
							},
						},
					})
				),
				quote:
					version === "b2c"
						? quoteCreatorB2c(message?.order?.items, providersItems?.items)
						: quoteCreator(message.order.items),
			},
		};

		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_select" : "/on_select"
			}`,
			`on_select`,
			"retail",
			{
				type: "DOMAIN-ERROR",
				code: "30009",
				message: "Item not Serviceable",
			}
		);
	} catch (error) {
		next(error);
	}
};

export const selectQuantityUnavailableController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { version } = req.query;
		const { context, message, providersItems } = req.body;
		const { ttl, ...provider } = message.order.provider;

		let responseMessage = {
			order: {
				provider,
				payments: [message.order.payments[0]],
				items: message.order.items.map(
					({
						location_ids,
						add_ons,
						...remaining
					}: {
						location_ids: string[];
						add_ons: any;
						remaining: any;
					}) => ({
						...remaining,
					})
				),
				fulfillments: message.order.fulfillments.map(
					({ id, ...each }: { id: string; each: any }) => ({
						id,
						tracking: false,
						"@ondc/org/provider_name": "ONDC Mock Server",
						"@ondc/org/category": "Express Delivery",
						"@ondc/org/TAT": "P7D",
						state: {
							descriptor: {
								code: "Serviceable",
							},
						},
					})
				),
				quote:
					version === "b2c"
						? quoteCreatorB2c(message?.order?.items, providersItems?.items)
						: quoteCreator(message.order.items),
			},
		};
		return responseBuilder(
			res,
			next,
			context,
			responseMessage,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_select" : "/on_select"
			}`,
			`on_select`,
			"retail",
			{
				type: "DOMAIN-ERROR",
				code: "40002",
				message: "Quantity Unavailable",
			}
		);
	} catch (error) {
		next(error);
	}
};
