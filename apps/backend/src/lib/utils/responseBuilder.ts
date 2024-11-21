//new code for transaction anylyser( changes in redis set with id)

import axios from "axios";
import { NextFunction, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
	AGRI_BPP_MOCKSERVER_URL,
	AGRI_EQUIPMENT_BPP_MOCKSERVER_URL,
	AGRI_SERVICES_BPP_MOCKSERVER_URL,
	B2B_BPP_MOCKSERVER_URL,
	B2C_BPP_MOCKSERVER_URL,
	HEALTHCARE_SERVICES_BPP_MOCKSERVER_URL,
	LOGISTICS_BPP_MOCKSERVER_URL,
	MOCKSERVER_ID,
	REATIL_BPP_MOCKSERVER_URL,
	SERVICES_BPP_MOCKSERVER_URL,
	SUBSCRIPTION_BPP_MOCKSERVER_URL,
} from "./constants";
import { createAuthHeader } from "./responseAuth";
import { logger } from "./logger";
import { TransactionType, redis } from "./redis";
import { AxiosError } from "axios";
import { ON_ACTION_KEY } from "./actionOnActionKeys";
import {
	FULFILLMENT_END,
	FULFILLMENT_LABELS,
	FULFILLMENT_START,
	FULFILLMENT_STATES,
	FULFILLMENT_TYPES,
	SCENARIO,
	SERVICES_DOMAINS,
} from "./apiConstants";
import { calculateQuotePrice } from "./getISODuration";
import { values } from "lodash";

interface TagDescriptor {
	code: string;
}

interface TagList {
	descriptor: TagDescriptor;
	value: string;
}

interface Quantity {
	count: any;
	selected: {
		count: number;
	};
}

interface AddOn {
	id: string;
}

interface Tag {
	descriptor: TagDescriptor;
	list: TagList[];
}

interface Item {
	available_quantity: any;
	price: any;
	title: any;
	fulfillment_ids: string[];
	id: string;
	quantity: Quantity;
	add_ons: AddOn[];
	tags: Tag[];
}

export const responseBuilder = async (
	res: Response,
	next: NextFunction,
	reqContext: object,
	message: object,
	uri: string,
	action: string,
	domain:
		| "b2b"
		| "b2c"
		| "services"
		| "agri-services"
		| "healthcare-service"
		| "agri-equipment-hiring"
		| "retail"
		| "logistics"
		| "subscription"
		| "agri",

	error?: object | undefined,
	id: number = 0
) => {
	res.locals = {};

	let ts = new Date();
	// ts.setSeconds(ts.getSeconds() + 1);
	const sandboxMode = res.getHeader("mode") === "sandbox";

	var async: { message: object; context?: object; error?: object } = {
		context: {},
		message,
	};
	const bppURI =
		domain === "b2b"
			? B2B_BPP_MOCKSERVER_URL
			: domain === "b2c"
			? B2C_BPP_MOCKSERVER_URL
			: domain === "retail"
			? REATIL_BPP_MOCKSERVER_URL
			: domain === "logistics"
			? LOGISTICS_BPP_MOCKSERVER_URL
			: domain === "subscription"
			? SUBSCRIPTION_BPP_MOCKSERVER_URL
			: domain === "agri"
			? AGRI_BPP_MOCKSERVER_URL
			: SERVICES_BPP_MOCKSERVER_URL;

	if (action.startsWith("on_")) {
		async = {
			...async,
			context: {
				...reqContext,
				bpp_id: MOCKSERVER_ID,
				bpp_uri: bppURI,
				timestamp: ts.toISOString(),
				action,
			},
		};
	} else {
		// const { bpp_uri, bpp_id, ...remainingContext } = reqContext as any;
		async = {
			...async,
			context: {
				// ...remainingContext,
				...reqContext,
				bap_id: MOCKSERVER_ID,
				bap_uri: bppURI,
				timestamp: ts.toISOString(),
				message_id: uuidv4(),
				action,
			},
		};
	}

	if (error) {
		async = { ...async, error };
	}

	const header = await createAuthHeader(async);

	if (sandboxMode) {
		if (action.startsWith("on_")) {
			var log: TransactionType = {
				request: async,
			};
			if (action === "on_status") {
				const transactionKeys = await redis.keys(
					`*-${(async.context! as any).transaction_id}-*`
				);
				const logIndex = transactionKeys.filter((e) =>
					e.includes("on_status-to-server")
				).length;
				if (domain === "services") {
					await redis.set(
						`${
							(async.context! as any).transaction_id
						}-${action}-from-server-${id}-${ts.toISOString()}`,
						JSON.stringify(log)
					);
				} else {
					await redis.set(
						`${
							(async.context! as any).transaction_id
						}-${logIndex}-${action}-from-server-${id}-${ts.toISOString()}`,
						JSON.stringify(log)
					);
				}
			} else {
				await redis.set(
					`${
						(async.context! as any).transaction_id
					}-${action}-from-server-${id}-${ts.toISOString()}`,
					JSON.stringify(log)
				);
			}

			try {
				console.log("URI BEING SENT :::", uri);
				const response = await axios.post(`${uri}?mode=mock`, async, {
					headers: {
						authorization: header,
					},
				});

				log.response = {
					timestamp: new Date().toISOString(),
					response: response.data,
				};

				await redis.set(
					`${
						(async.context! as any).transaction_id
					}-${action}-from-server-${id}-${ts.toISOString()}`,
					JSON.stringify(log)
				);
			} catch (error) {
				const response =
					error instanceof AxiosError
						? error?.response?.data
						: {
								message: {
									ack: {
										status: "NACK",
									},
								},
								error: {
									message: error,
								},
						  };
				log.response = {
					timestamp: new Date().toISOString(),
					response: response,
				};
				await redis.set(
					`${
						(async.context! as any).transaction_id
					}-${action}-from-server-${id}-${ts.toISOString()}`,
					JSON.stringify(log)
				);

				if (error instanceof AxiosError) {
					return res.status(error.status ? error.status : 500).json(response);
				}

				return next(error);
			}
		}

		logger.info({
			type: "response",
			action: action,
			transaction_id: (reqContext as any).transaction_id,
			message: { sync: { message: { ack: { status: "ACK" } } } },
		});
		return res.json({
			message: {
				ack: {
					status: "ACK",
				},
			},
		});
	} else {
		logger.info({
			type: "response",
			action: action,
			transaction_id: (reqContext as any).transaction_id,
			message: { sync: { message: { ack: { status: "ACK" } } } },
		});
		return res.json({
			sync: {
				message: {
					ack: {
						status: "ACK",
					},
				},
			},
			error,
			// async,
		});
	}
};

export const sendStatusAxiosCall = async (
	reqContext: object,
	message: object,
	uri: string,
	action: string,
	domain:
		| "b2b"
		| "services"
		| "agri-services"
		| "healthcare-service"
		| "agri-equipment-hiring"
		| "logistics",
	error?: object | undefined
) => {
	let ts = new Date();
	ts.setSeconds(ts.getSeconds() + 1);

	let async: { message: object; context?: object; error?: object } = {
		context: {},
		message,
	};

	const bppURI =
		domain === "b2b"
			? B2B_BPP_MOCKSERVER_URL
			: domain === "agri-services"
			? AGRI_SERVICES_BPP_MOCKSERVER_URL
			: domain === "logistics"
			? LOGISTICS_BPP_MOCKSERVER_URL
			: domain === "healthcare-service"
			? HEALTHCARE_SERVICES_BPP_MOCKSERVER_URL
			: domain === "agri-equipment-hiring"
			? AGRI_EQUIPMENT_BPP_MOCKSERVER_URL
			: SERVICES_BPP_MOCKSERVER_URL;

	async = {
		...async,
		context: {
			...reqContext,
			bpp_id: MOCKSERVER_ID,
			bpp_uri: bppURI,
			timestamp: ts.toISOString(),
			action,
		},
	};

	if (error) {
		async = { ...async, error };
	}

	const header = await createAuthHeader(async);

	if (action.startsWith("on_")) {
		var log: TransactionType = {
			request: async,
		};
		try {
			const response = await axios.post(uri, async, {
				headers: {
					authorization: header,
				},
			});
			log.response = {
				timestamp: new Date().toISOString(),
				response: response.data,
			};
			await redis.set(
				`${(async.context! as any).transaction_id}-${action}-from-server`,
				JSON.stringify(log)
			);
		} catch (error) {
			const response =
				error instanceof AxiosError
					? error?.response?.data
					: {
							message: {
								ack: {
									status: "NACK",
								},
							},
							error: {
								message: error,
							},
					  };
			log.response = {
				timestamp: new Date().toISOString(),
				response: response,
			};

			await redis.set(
				`${(async.context! as any).transaction_id}-${action}-from-server`,
				JSON.stringify(log)
			);
		}
	}

	logger.info({
		type: "response",
		action: action,
		transaction_id: (reqContext as any).transaction_id,
		message: { sync: { message: { ack: { status: "ACK" } } } },
	});
};

export const quoteCreator = (items: Item[]) => {
	var breakup: any[] = [];
	const chargesOnFulfillment = [
		{
			"@ondc/org/item_id": "F1",
			title: "Delivery charges",
			"@ondc/org/title_type": "delivery",
			price: {
				currency: "INR",
				value: "4000",
			},
		},
		{
			"@ondc/org/item_id": "F1",
			title: "Packing charges",
			"@ondc/org/title_type": "packing",
			price: {
				currency: "INR",
				value: "500",
			},
		},
		{
			"@ondc/org/item_id": "F1",
			title: "Convenience Fee",
			"@ondc/org/title_type": "misc",
			price: {
				currency: "INR",
				value: "100",
			},
		},
	];

	const chargesOnItem = [
		{
			"@ondc/org/item_id": "I1",
			title: "Tax",
			"@ondc/org/title_type": "tax",
			price: {
				currency: "INR",
				value: "0",
			},
		},
		{
			"@ondc/org/item_id": "I1",
			title: "Discount",
			"@ondc/org/title_type": "discount",
			price: {
				currency: "INR",
				value: "-1000",
			},
		},
	];

	items.forEach((item: any) => {
		breakup = [
			...breakup,
			...chargesOnItem,
			{
				"@ondc/org/item_id": item.id,
				"@ondc/org/item_quantity": {
					count: item.quantity.selected.count,
				},
				title: "Product Name Here",
				"@ondc/org/title_type": "item",
				price: {
					currency: "INR",
					value: (item.quantity.selected.count * 250).toString(),
				},
				item: {
					price: {
						currency: "INR",
						value: "250",
					},
				},
			},
		];

		item.fulfillment_ids.forEach((eachId: string) => {
			breakup = [
				...breakup,
				...chargesOnFulfillment.map((each) => ({
					...each,
					"@ondc/org/item_id": eachId,
				})),
			];
		});
	});

	return {
		breakup,
		price: {
			currency: "INR",
			value: (53_600 * items.length).toString(),
		},
		ttl: "P1D",
	};
};

//B2C QUOTE CREATOR WITH DYNAMIC ITEMS AND PRICE
export const quoteCreatorB2c = (items: Item[], providersItems?: any) => {
	//get price from on_search
	let breakup: any[] = [];
	const chargesOnFulfillment = [
		{
			"@ondc/org/item_id": "F1",
			title: "Delivery charges",
			"@ondc/org/title_type": "delivery",
			price: {
				currency: "INR",
				value: "2.00",
			},
		},
		{
			"@ondc/org/item_id": "F1",
			title: "Packing charges",
			"@ondc/org/title_type": "packing",
			price: {
				currency: "INR",
				value: "5.00",
			},
		},
		{
			"@ondc/org/item_id": "F1",
			title: "Convenience Fee",
			"@ondc/org/title_type": "misc",
			price: {
				currency: "INR",
				value: "1.00",
			},
		},
	];

	const chargesOnItem = [
		{
			"@ondc/org/item_id": "I1",
			title: "Tax",
			"@ondc/org/title_type": "tax",
			price: {
				currency: "INR",
				value: "0.00",
			},
		},
		{
			"@ondc/org/item_id": "I1",
			title: "Discount",
			"@ondc/org/title_type": "discount",
			price: {
				currency: "INR",
				value: "-3.00",
			},
		},
	];

	items.forEach((item) => {
		// Find the corresponding item in the second array
		if (providersItems) {
			const matchingItem = providersItems.find(
				(secondItem: { id: string }) => secondItem?.id === item?.id
			);
			// If a matching item is found, update the price in the items array
			if (matchingItem) {
				item.title = matchingItem?.descriptor?.name;
				// item.price = matchingItem?.price;
				item.price = {
					currency: matchingItem.price.currency,
					value: matchingItem.price.value,
				};
				if (matchingItem?.tags[0].descriptor.code !== "origin") {
					item.tags = matchingItem?.tags;
				}
			}
		}
	});

	items.forEach((item) => {
		breakup = [
			...chargesOnItem,
			{
				title: item.title,
				"@ondc/org/item_id": item.id,
				"@ondc/org/item_quantity": {
					count: item.quantity.selected.count,
				},
				"@ondc/org/title_type": "item",
				price: {
					currency: "INR",
					value: (
						Number(item?.price?.value) * item?.quantity?.selected?.count
					).toString(),
				},
				tags: item.tags,
				item: {
					// id: item.id,
					price: item.price,
					// quantity: item.quantity ? item.quantity : undefined,
				},
			},
		];
		item.fulfillment_ids.forEach((eachId: string) => {
			breakup = [
				...breakup,
				...chargesOnFulfillment.map((each) => ({
					...each,
					"@ondc/org/item_id": eachId,
				})),
			];
		});
	});

	//MAKE DYNAMIC BREACKUP USING THE DYANMIC ITEMS
	let totalPrice = 0;
	breakup.forEach((entry) => {
		const priceValue = parseFloat(entry.price.value);
		if (!isNaN(priceValue)) {
			totalPrice += priceValue;
		}
	});

	const result = {
		breakup,
		price: {
			currency: "INR",
			value: totalPrice.toFixed(2),
		},
		ttl: "P1D",
	};

	return result;
};

//AGRI DOMAIN QUOTE CREATORS
export const quoteCreatorAgri = (items: Item[], providersItems?: any) => {
	// console.log("itemssssssssssss", items, providersItems);
	//get price from on_search
	let breakup: any[] = [];
	const chargesOnFulfillment = [
		{
			"@ondc/org/item_id": "5009-Delivery",
			"@ondc/org/title_type": "delivery",
			price: {
				currency: "INR",
				value: "10",
			},
			title: "Delivery charges",
		},
		{
			"@ondc/org/item_id": "5009-Delivery",
			"@ondc/org/title_type": "packing",
			price: {
				currency: "INR",
				value: "0",
			},
			title: "Packing charges",
		},
		{
			"@ondc/org/item_id": "5009-Delivery",
			"@ondc/org/title_type": "misc",
			price: {
				currency: "INR",
				value: "0",
			},
			title: "Convenience Fee",
		},
	];

	// console.log("itemssssssssssssEachhhhhhhhhhhh", items);
	items.forEach((item) => {
		// Find the corresponding item in the second array
		if (providersItems) {
			const matchingItem = providersItems.find(
				(secondItem: { id: string }) => secondItem?.id === item?.id
			);
			// If a matching item is found, update the price in the items array
			if (matchingItem) {
				item.title = matchingItem?.descriptor?.name;
				// item.price = matchingItem?.price;
				item.available_quantity = {
					available:matchingItem?.quantity?.available,
					maximum:matchingItem?.quantity?.maximum
				};
				item.price = {
					currency: matchingItem.price.currency,
					value: matchingItem.price.value,
				};
			}
		}
	});
	items.forEach((item) => {
		// console.log("itemsbreakup",item)
		breakup = [...breakup,
			{
				title: item.title,
				"@ondc/org/item_id": item.id,
				"@ondc/org/item_quantity": {
					count: item?.quantity?.count? item?.quantity?.count:item?.quantity?.selected?.count,
				},
				"@ondc/org/title_type": "item",
				price: {
					currency: "INR",
					value: (
						Number(item?.price?.value) * item?.quantity?.count?item?.quantity?.count:item?.quantity?.selected?.count
					).toString(),
				},
				tags: item.tags,
				item: {
					// id: item.id,
					price: item.price,
					quantity: item.available_quantity ? item.available_quantity : undefined,
				},
			},
			{
				"@ondc/org/item_id": item?.id,
				"@ondc/org/title_type": "tax",
				price: {
					currency: "INR",
					value: "0.00",
				},
				title: "Tax",
			},
			{
				"@ondc/org/item_id": item?.id,
				"@ondc/org/title_type": "discount",
				price: {
					currency: "INR",
					value: "0",
				},
				title: "Discount",
			},
		];
		
	});

	//MAKE DYNAMIC BREACKUP USING THE DYANMIC ITEMS
	let totalPrice = 0;
	breakup.forEach((entry) => {
		const priceValue = parseFloat(entry.price.value);
		if (!isNaN(priceValue)) {
			totalPrice += priceValue;
		}
	});
	chargesOnFulfillment.forEach((entry) => {
		const priceValue = parseFloat(entry.price.value);
		if (!isNaN(priceValue)) {
			totalPrice += priceValue;
		}
	});

	
	const result = {
		breakup:[
			...breakup,
			...chargesOnFulfillment
		],
		price: {
			currency: "INR",
			value: totalPrice.toFixed(2),
		},
		ttl: "P1D",
	};

	// console.log("resultttttttttt", JSON.stringify(result));
	return result;
};

export const quoteCreatorAgriService = (
	items: Item[],
	providersItems?: any
) => {
	//get price from on_search
	items.forEach((item) => {
		// Find the corresponding item in the second array
		if (providersItems) {
			const matchingItem = providersItems.find(
				(secondItem: { id: string }) => secondItem?.id === item?.id
			);
			// If a matching item is found, update the price in the items array
			if (matchingItem) {
				item.title = matchingItem?.descriptor?.name;
				item.price = matchingItem?.price;
				item.tags = matchingItem?.tags;
			}
		}
	});

	let breakup: any[] = [];

	items.forEach((item) => {
		breakup.push({
			title: item.title,
			price: {
				currency: "INR",
				value: (
					Number(item?.price?.value) * item?.quantity?.selected?.count
				).toString(),
			},
			tags: item.tags,
			item:
				item.title === "tax"
					? {
							id: item.id,
					  }
					: {
							id: item.id,
							price: item.price,
							quantity: item.quantity ? item.quantity : undefined,
					  },
		});
	});

	//ADD STATIC TAX IN BREAKUP QUOTE
	breakup.push({
		title: "tax",
		price: {
			currency: "INR",
			value: "10",
		},
		item: items[0],
		tags: [
			{
				descriptor: {
					code: "title",
				},
				list: [
					{
						descriptor: {
							code: "type",
						},
						value: "tax",
					},
				],
			},
		],
	});

	breakup?.push({
		title: "pickup_charge",
		price: {
			currency: "INR",
			value: "149",
		},
		item: {
			id: "I1",
		},
		tags: [
			{
				descriptor: {
					code: "title",
				},
				list: [
					{
						descriptor: {
							code: "type",
						},
						value: "misc",
					},
				],
			},
		],
	});
	//MAKE DYNAMIC BREACKUP USING THE DYANMIC ITEMS
	let totalPrice = 0;
	breakup.forEach((entry) => {
		const priceValue = parseFloat(entry.price.value);
		if (!isNaN(priceValue)) {
			totalPrice += priceValue;
		}
	});

	const result = {
		breakup,
		price: {
			currency: "INR",
			value: totalPrice.toFixed(2),
		},
		ttl: "P1D",
	};

	return result;
};

export const quoteCreatorHealthCareService = (
	items: Item[],
	providersItems?: any,
	offers?: any,
	fulfillment_type?: string,
	service_name?: string,
	scenario?: string
) => {
	try {
		//GET PACKAGE ITEMS
		//get price from on_search
		items.forEach((item) => {
			if (
				item &&
				item?.tags &&
				item?.tags[0] &&
				item?.tags[0]?.list[0]?.value === "PACKAGE"
			) {
				const getItems = item.tags[0].list[1].value.split(",");
				getItems.forEach((pItem) => {
					// Find the corresponding item in the second array
					if (providersItems) {
						const matchingItem = providersItems?.find(
							(secondItem: { id: string }) => secondItem.id === pItem
						);
						// If a matching item is found, update the price in the items array

						if (matchingItem) {
							items.push({ ...matchingItem, quantity: item?.quantity });
						}
					}
				});
			}
		});

		items.forEach((item) => {
			// Find the corresponding item in the second array
			if (providersItems) {
				const matchingItem = providersItems?.find(
					(secondItem: { id: string }) => secondItem.id === item.id
				);
				// If a matching item is found, update the price in the items array
				if (matchingItem) {
					item.title = matchingItem?.descriptor?.name;
					item.price = matchingItem?.price;
					item.tags = matchingItem?.tags;
				}
			}
		});

		let breakup: any[] = [];

		items.forEach((item: any) => {
			const quantity = item?.quantity?.selected?.count
				? item?.quantity?.selected?.count
				: Number(item?.quantity?.unitized?.measure?.value);
			breakup.push({
				title: item.title,
				price: {
					currency: "INR",
					value: (Number(item?.price?.value) * quantity).toString(),
				},
				tags: item?.tags,
				item:
					item.title === "tax"
						? {
								id: item?.id,
						  }
						: {
								id: item?.id,
								price: item?.price,
								quantity: item?.quantity ? item?.quantity : undefined,
						  },
			});
		});

		//MAKE DYNAMIC BREACKUP USING THE DYANMIC ITEMS

		//ADD STATIC TAX AND DISCOUNT FOR ITEM ONE
		breakup?.push(
			{
				title: "tax",
				price: {
					currency: "INR",
					value: "10",
				},
				item: items[0],
				tags: [
					{
						descriptor: {
							code: "title",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "tax",
							},
						],
					},
				],
			},
			{
				title: "discount",
				price: {
					currency: "INR",
					value: "10",
				},
				item: items[0],
				tags: [
					{
						descriptor: {
							code: "title",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "discount",
							},
						],
					},
				],
			}
		);

		if (
			(fulfillment_type && fulfillment_type === "Seller-Fulfilled") ||
			service_name === "agri-equipment-hiring" ||
			service_name !== "bid_auction_service"
		) {
			breakup?.push({
				title: "pickup_charge",
				price: {
					currency: "INR",
					value: "149",
				},
				item: items[0],
				tags: [
					{
						descriptor: {
							code: "title",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "misc",
							},
						],
					},
				],
			});
		}

		if (service_name === "agri-equipment-hiring") {
			breakup?.push({
				title: "refundable_security",
				price: {
					currency: "INR",
					value: "5000",
				},
				item: items[0],
				tags: [
					{
						descriptor: {
							code: "title",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "refundable_security",
							},
						],
					},
				],
			});
		}

		if (
			service_name === "bid_auction_service" &&
			scenario === "participation_fee"
		) {
			breakup = [
				{
					title: "earnest_money_deposit",
					price: {
						currency: "INR",
						value: "5000.00",
					},
					item: items[0],
					tags: [
						{
							descriptor: {
								code: "TITLE",
							},
							list: [
								{
									descriptor: {
										code: "type",
									},
									value: "earnest_money_deposit",
								},
							],
						},
					],
				},
			];
		} else if (
			service_name === "bid_auction_service" &&
			scenario === "bid_placement"
		) {
			breakup?.push({
				title: "earnest_money_deposit",
				price: {
					currency: "INR",
					value: "5000.00",
				},
				item: items[0],
				tags: [
					{
						descriptor: {
							code: "TITLE",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "earnest_money_deposit",
							},
						],
					},
				],
			});
		}

		let totalPrice = 0;
		breakup.forEach((entry) => {
			const priceValue = parseFloat(entry?.price?.value);

			if (!isNaN(priceValue)) {
				if (entry?.title === "discount") {
					totalPrice -= priceValue;
				} else {
					totalPrice += priceValue;
				}
			}
		});

		const result = {
			breakup,
			price: {
				currency: "INR",
				value: totalPrice.toFixed(2),
			},
			ttl: "P1D",
		};

		return result;
	} catch (error: any) {
		return error;
	}
};

//QUOTE FOR SUBSCRIPTION PROCESS
export const quoteSubscription = (
	items: Item[],
	providersItems?: any,
	scenario?: any,
	fulfillment?: any
) => {
	try {
		//GET PACKAGE ITEMS
		//get price from on_search
		items.forEach((item) => {
			if (
				item &&
				item?.tags &&
				item?.tags[0] &&
				item?.tags[0]?.list[0]?.value === "PACKAGE"
			) {
				const getItems = item.tags[0].list[1].value.split(",");
				getItems.forEach((pItem) => {
					// Find the corresponding item in the second array
					if (providersItems) {
						const matchingItem = providersItems?.find(
							(secondItem: { id: string }) => secondItem.id === pItem
						);
						// If a matching item is found, update the price in the items array

						if (matchingItem) {
							items.push({ ...matchingItem, quantity: item?.quantity });
						}
					}
				});
			}
		});

		items.forEach((item) => {
			// Find the corresponding item in the second array
			if (providersItems) {
				const matchingItem = providersItems?.find(
					(secondItem: { id: string }) => secondItem.id === item.id
				);
				// If a matching item is found, update the price in the items array
				if (matchingItem) {
					item.title = matchingItem?.descriptor?.name;
					item.price = matchingItem?.price;
					item.tags = matchingItem?.tags;
				}
			}
		});

		let breakup: any[] = [];

		items.forEach((item: any) => {
			const quantity = item?.quantity?.selected?.count
				? item?.quantity?.selected?.count
				: Number(item?.quantity?.unitized?.measure?.value);
			breakup.push({
				title: item.title,
				price: {
					currency: "INR",
					value: (Number(item?.price?.value) * quantity).toString(),
				},
				tags: item?.tags,
				item:
					item.title === "tax"
						? {
								id: item?.id,
						  }
						: {
								id: item?.id,
								price: item?.price,
								quantity: item?.quantity ? item?.quantity : undefined,
						  },
			});
		});

		//MAKE DYNAMIC BREACKUP USING THE DYANMIC ITEMS

		//ADD STATIC TAX AND DISCOUNT FOR ITEM ONE
		breakup?.push(
			{
				title: "tax",
				price: {
					currency: "INR",
					value: "10",
				},
				item: items[0],
				tags: [
					{
						descriptor: {
							code: "title",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "tax",
							},
						],
					},
				],
			},
			{
				title: "discount",
				price: {
					currency: "INR",
					value: "10",
				},
				item: items[0],
				tags: [
					{
						descriptor: {
							code: "title",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "discount",
							},
						],
					},
				],
			}
		);

		let totalPrice = 0;
		breakup.forEach((entry) => {
			const priceValue = parseFloat(entry?.price?.value);

			if (!isNaN(priceValue)) {
				if (entry?.title === "discount") {
					totalPrice -= priceValue;
				} else {
					totalPrice += priceValue;
				}
			}
		});

		const quotePrice =
			scenario === "single-order"
				? totalPrice
				: calculateQuotePrice(
						fulfillment?.stops[0]?.time?.duration,
						fulfillment?.stops[0]?.time.schedule?.frequency,
						totalPrice
				  );

		const result = {
			breakup,
			price: {
				currency: "INR",
				value: quotePrice.toFixed(2),
			},
			ttl: "P1D",
		};

		return result;
	} catch (error: any) {
		return error;
	}
};

export const quoteCommon = (tempItems: Item[], providersItems?: any) => {
	const items: Item[] = JSON.parse(JSON.stringify(tempItems));
	//get price from on_search
	items.forEach((item) => {
		// Find the corresponding item in the second array
		const matchingItem = providersItems.find(
			(secondItem: { id: string }) => secondItem.id === item.id
		);
		// If a matching item is found, update the price in the items array
		if (matchingItem) {
			item.title = matchingItem?.descriptor?.name;
			const pp = {
				currency: matchingItem.price.currency,
				value: matchingItem.price.value,
			};
			item.price = pp;
			if (matchingItem?.tags[0].descriptor.code != "reschedule_terms") {
				item.tags = matchingItem?.tags;
			} else {
				const tag = [
					{
						descriptor: {
							code: "title",
						},
						list: [
							{
								descriptor: {
									code: "type",
								},
								value: "item",
							},
						],
					},
				];
				item.tags = tag;
			}
		}
	});

	let breakup: any[] = [];

	items.forEach((item) => {
		breakup.push({
			title: item.title,
			price: {
				currency: "INR",
				value: (
					Number(item.price.value) * item.quantity.selected.count
				).toString(),
			},
			tags: item.tags,
			item: {
				id: item.id,
				price: item.price,
				quantity: item.quantity ? item.quantity : undefined,
			},
		});
	});
	const price = {
		currency: items[0].price.currency,
		value: items[0].price.value,
	};

	const itemtobe = {
		id: items[0].id,
		price: price,
		quantity: items[0].quantity,
	};
	//ADD STATIC TAX IN BREAKUP QUOTE
	breakup.push({
		title: "tax",
		price: {
			currency: "INR",
			value: "10",
		},
		item: itemtobe,
		tags: [
			{
				descriptor: {
					code: "title",
				},
				list: [
					{
						descriptor: {
							code: "type",
						},
						value: "tax",
					},
				],
			},
		],
	});

	//MAKE DYNAMIC BREACKUP USING THE DYANMIC ITEMS

	let totalPrice = 0;

	breakup.forEach((entry) => {
		const priceValue = parseFloat(entry.price.value);
		if (!isNaN(priceValue)) {
			totalPrice += priceValue;
		}
	});

	const result = {
		breakup,
		price: {
			currency: "INR",
			value: totalPrice.toFixed(2),
		},
		ttl: "P1D",
	};

	return result;
};

export const quoteCreatorService = (items: Item[], providersItems?: any) => {
	let result;
	if (providersItems) {
		result = quoteCommon(items, providersItems);
	}
	result?.breakup?.push({
		title: "discount",
		price: {
			currency: "INR",
			value: "0",
		},
		item: {
			id: "I1",
			quantity: {
				selected: {
					count: 1,
				},
			},
			price: {
				currency: "INR",
				value: "474",
			},
		},
		tags: [
			{
				descriptor: {
					code: "title",
				},
				list: [
					{
						descriptor: {
							code: "type",
						},
						value: "discount",
					},
				],
			},
		],
	});
	result?.breakup?.push({
		title: "convenience_fee",
		price: {
			currency: "INR",
			value: "0",
		},
		item: {
			id: "I1",
			quantity: {
				selected: {
					count: 1,
				},
			},
			price: {
				currency: "INR",
				value: "474",
			},
		},
		tags: [
			{
				descriptor: {
					code: "title",
				},
				list: [
					{
						descriptor: {
							code: "type",
						},
						value: "misc",
					},
				],
			},
		],
	});
	return result;
};

export const quoteCreatorServiceCustomized = (
	items: Item[],
	providersItems?: any
) => {
	let result;
	if (providersItems) {
		result = quoteCommon(items, providersItems);
	}
	result?.breakup?.push({
		title: "convenience_fee",
		price: {
			currency: "INR",
			value: "0",
		},
		item: {
			id: "I1",
		},
		tags: [
			{
				descriptor: {
					code: "title",
				},
				list: [
					{
						descriptor: {
							code: "type",
						},
						value: "misc",
					},
				],
			},
		],
	});
	return result;
};

export const checkIfCustomized = (items: Item[]) => {
	return items.some(
		(item) =>
			item.tags &&
			item.tags.some(
				(tag) =>
					tag.list &&
					tag.list.some((subTag) => {
						if (subTag.descriptor.code === "type") {
							return subTag.value === "customization";
						}
					})
			)
	);
};

//Function for check selected items are existed in onsearch or not
export const checkSelectedItems = async (data: any) => {
	try {
		const { message, providersItems } = data;
		const items = message?.order?.items;
		const providersItem = providersItems?.items;
		let matchingItem: any = null;

		items.forEach((item: any) => {
			if (item) {
				const selectedItem = item?.id;
				// Find the corresponding item in the second array
				if (providersItem) {
					matchingItem = providersItem?.find(
						(secondItem: { id: string }) => secondItem.id === selectedItem
					);
				}
			}
		});

		return matchingItem;
	} catch (error) {
		console.log("error occured in matching content");
	}
};

export const updateFulfillments = (
	fulfillments?: any,
	action?: string,
	scenario?: string,
	domain?: string
) => {
	try {
		// Update fulfillments according to actions
		const rangeStart = new Date().setHours(new Date().getHours() + 2).toString();
		const rangeEnd = new Date().setHours(new Date().getHours() + 3).toString();

		let updatedFulfillments: any = [];

		if (!fulfillments || fulfillments.length === 0) {
			return updatedFulfillments; // Return empty if fulfillments is not provided or empty
		}

		let fulfillmentObj: any;

		if (domain === "agri_input") {
			fulfillmentObj = {
				id: fulfillments[0]?.id ? fulfillments[0].id : "5009-Delivery",
				"@ondc/org/category": "Standard Delivery",
				"@ondc/org/provider_name": "Agro Fertilizer Store",
				"@ondc/org/TAT": "P2D",
				
			};
		} else {
			fulfillmentObj = {
				id: fulfillments[0]?.id ? fulfillments[0].id : "F1",
				// stops: fulfillments[0]?.stops.map((ele: any) => {
				// 	ele.time.label = FULFILLMENT_LABELS.CONFIRMED;
				// 	return ele;
				// }),
				tags: {
					descriptor: {
						code: "schedule",
					},
					list: [
						{
							descriptor: {
								code: "ttl",
							},
							value: "PT1H",
						},
					],
				},
			};
		}

		if (domain !== "subscription" && domain !== "agri_input") {
			fulfillmentObj.tracking = false;
			fulfillmentObj.state = {
				descriptor: {
					code: FULFILLMENT_STATES.SERVICEABLE,
				},
			};
			fulfillmentObj.type = fulfillments[0]?.type;
			delete fulfillmentObj.tags;
		} else if (domain === "agri_input") {
			fulfillmentObj.state = {
				descriptor: {
					code: FULFILLMENT_STATES.SERVICEABLE,
				},
			};
			fulfillmentObj.type = "Delivery";
		
			delete fulfillmentObj.tags;
		} else {
			fulfillmentObj.stops = fulfillments[0]?.stops.map((ele: any) => {
				action;
				ele.time.range.end = new Date(rangeEnd).toISOString();
				return ele;
			});
			fulfillmentObj.type = fulfillments[0]?.type;
		}
		if (
			domain !== SERVICES_DOMAINS.BID_ACTION_SERVICES &&
			domain !== "subscription" &&
			domain !== "agri_input"
		) {
			fulfillmentObj = {
				...fulfillmentObj,
				type: FULFILLMENT_TYPES.SELLER_FULFILLED,
			};
		}
		switch (action) {
			case ON_ACTION_KEY.ON_SELECT:
				// Always push the initial fulfillmentObj
				updatedFulfillments.push(fulfillmentObj);
				if (scenario === SCENARIO.MULTI_COLLECTION) {
					updatedFulfillments.push({
						...fulfillmentObj,
						id: "F2",
					});
				}
				break;
			case ON_ACTION_KEY.ON_CONFIRM:
				updatedFulfillments = fulfillments;
				// Add your logic for ON_CONFIRM
				updatedFulfillments = updatedFulfillments.map((fulfill: any) => {
					(fulfill.state = {
						descriptor: {
							code: FULFILLMENT_STATES.PENDING,
						},
					}),
						fulfill.stops.push({
							type: "start",
							...FULFILLMENT_START,
							time: {
								range: {
									start: new Date(rangeStart).toISOString(),
									end: new Date(rangeEnd).toISOString(),
								},
							},
						}),
						(fulfill.stops = fulfill?.stops?.map((ele: any) => {
							if (ele?.type === "end") {
								ele = {
									...ele,
									...FULFILLMENT_END,
									time: {
										...ele.time,
										label: FULFILLMENT_LABELS.CONFIRMED,
									},
									person:
										ele.customer && ele.customer.person
											? ele.customer.person
											: FULFILLMENT_END.person,
								};
							}
							return ele;
						})),
						(fulfill.rateable = true);
					return fulfill;
				});
				break;
			case ON_ACTION_KEY.ON_CANCEL:
				updatedFulfillments = fulfillments;
				updatedFulfillments = updatedFulfillments.map((fulfillment: any) => {
					if (fulfillment.type === "Delivery") {
					  return {
						...fulfillment,
						state: {
						  ...fulfillment.state,
						  descriptor: {
							code: FULFILLMENT_STATES.CANCELLED,
						  },
						},
						end: {
						  ...fulfillment.end,
						  time: {
							range: {
							  end: rangeEnd,
							  start: rangeStart,
							},
						  },
						},
						start: {
						  ...fulfillment.start,
						  time: {
							range: {
							  end: rangeEnd,
							  start: rangeStart,
							},
						  },
						},
						tags: [
						  {
							code: "cancel_request",
							list: [
							  {
								code: "reason_id",
								value: "010",
							  },
							  {
								code: "initiated_by",
								value: "buyer-app.com",
							  },
							],
						  },
						  {
							code: "precancel_state",
							list: [
							  {
								code: "fulfillment_state",
								value: "Pending",
							  },
							  {
								code: "updated_at",
								value: "2024-03-15T13:00:16.744Z",
							  },
							],
						  },
						],
						rateable: undefined,
					  };
					} else if (fulfillment.type === "Cancel") {
					  return {
						...fulfillment,
						state: {
						  ...fulfillment.state,
						  descriptor: {
							code: FULFILLMENT_STATES.CANCELLED,
						  },
						},
						tags: [
						  {
							code: "quote_trail",
							list: [
							  {
								code: "type",
								value: "item",
							  },
							  {
								code: "id",
								value: "13959",
							  },
							  {
								code: "currency",
								value: "INR",
							  },
							  {
								code: "value",
								value: "-1798.00",
							  },
							],
						  },
						  {
							code: "quote_trail",
							list: [
							  {
								code: "type",
								value: "item",
							  },
							  {
								code: "id",
								value: "14574",
							  },
							  {
								code: "currency",
								value: "INR",
							  },
							  {
								code: "value",
								value: "-1640.00",
							  },
							],
						  },
						  {
							code: "quote_trail",
							list: [
							  {
								code: "type",
								value: "delivery",
							  },
							  {
								code: "id",
								value: "5009-Delivery",
							  },
							  {
								code: "currency",
								value: "INR",
							  },
							  {
								code: "value",
								value: "-10.00",
							  },
							],
						  },
						],
						rateable: undefined,
					  };
					}
				  
					// Default return if no conditions are met
					return fulfillment;
				  });
				break;
			case ON_ACTION_KEY.ON_UPDATE:
				updatedFulfillments = fulfillments;
				updatedFulfillments = updatedFulfillments.map((fulfillment: any) => ({
					...fulfillment,
					state: {
						...fulfillment.state,
						descriptor: {
							code: FULFILLMENT_STATES.COMPLETED,
						},
					},
					rateable: true,
				}));
				break;
			default:
				// Add your default logic if any
				updatedFulfillments = fulfillments;
				break;
		}

		// console.log(
		// 	"updatedFulfillmentssssssssssss",
		// 	JSON.stringify(updatedFulfillments)
		// );
		return updatedFulfillments;
	} catch (err) {
		console.log("Error occured in fulfillments method", err);
	}
};
