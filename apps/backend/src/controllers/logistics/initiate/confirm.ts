import { NextFunction, Request, Response } from "express";
import {
	send_response,
	redis,
	send_nack,
	redisFetchToServer,
	redisFetchFromServer,
	logger,
} from "../../../lib/utils";

import { v4 as uuidv4 } from "uuid";
import { time } from "console";

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
				time: {
					label: "TAT",
					duration: "P7D",
				},
			};
		});

		let startstartDate = new Date();
		startstartDate.toISOString();
		let startendDate = new Date();
		startendDate.setMinutes(startstartDate.getDate() + 30);
		let endstartDate = new Date();
		endstartDate.setDate(startstartDate.getDate() + 7);
		let endendDate = new Date();
		endendDate.setMinutes(startstartDate.getDate() + 30);
		var newTime = new Date().toISOString();
		// const confirmFulfillments = [
		// 	{
		// 		...Init.message.order.fulfillments[0],
		// 		stops: Init.message.order.fulfillments[0]?.stops.map((e: any) => {
		// 			const instruction= {
		// 				additional_desc: {
		// 						content_type: "text/html",
		// 						url: "URL for instructions"
		// 				},
		// 				long_desc: "drop package at security gate",
		// 				short_desc: ""
		// 		}
		// 			return {
		// 				...e,
		// 				id: "L1",
		// 				parent_stop_id: "",
		// 			};
		// 		}),
		// 		agent: {
		// 			person: {
		// 				name: "Ramu",
		// 			},
		// 		},
		// 		customer: {
		// 			person: {
		// 				name: "xyz",
		// 			},
		// 			contact: {
		// 				phone: "9886098860",
		// 				email: "xyz.efgh@gmail.com",
		// 			},
		// 		},
		// 		tags: [
		// 			{
		// 				descriptor: {
		// 					code: "Delivery_Terms",
		// 				},
		// 				list: [
		// 					{
		// 						descriptor: {
		// 							code: "RTO_Action",
		// 						},
		// 						value: "no",
		// 					},
		// 				],
		// 			},
		// 		],
		// 	},
		// ];

		let confirmFulfilments = [
			{...Init.message.order.fulfillments[0],
			stops:Init.message.order.fulfillments[0]?.stops.map(
			(stop: any) => {
				// Add the instructions to both start and end stops
				const instructions = {
					// name: "Proof of pickup",
					short_desc: "Proof of pickup details",
					long_desc: "Proof of pickup details",
					additional_desc: {
                  content_type: "text/html",
                  url: "URL for instructions"
                }
				};
				// Check if the stop type is "end"
				if (stop.type === "end") {
					console.log("🚀 ~ stop.type:", stop.type);

					// Add the agent object to the stop
					return {
						...stop,
						id: "L2",
						parent_stop_id: "L1",
						instructions: {
							...instructions,
							// name: "Proof of delivery",
							short_desc: "Proof of delivery details",
							long_desc: "Proof of delivery details",
						},
						location: {
							...stop.location,
							country:{
								code:"IND",
								name:"India"
							}
						},
						// agent: {
						// 	person: {
						// 		name: "Ramu",
						// 	},
						// 	contact: {
						// 		phone: "9886098860",
						// 	},
						// },
					};
				} else if (stop.type === "start") {

					// For stops of type "start", add the instructions and location modifications
					return {
						...stop,
						id: "L1",
						parent_stop_id: "",
						location: {
							...stop.location,
							country:{
								code:"IND",
								name:"India"
							}
						
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
		agent: {
                        person: {
                            name: "Ramu"
                        }
                    },
                    customer: {
                        contact: {
                            email: "xyz.efgh@gmail.com",
                            phone: "9886098860"
                        },
                        person: {
                            name: "xyz"
                        }
                    },
									tags: [
                        {
                            descriptor: {
                                code: "Delivery_Terms"
                            },
                            list: [
                                {
                                    descriptor: {
                                        code: "RTO_Action"
                                    },
                                    value: "no"
                                }
                            ]
                        }
                    ],
                    type: "Delivery"
	}]


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
					fulfillments: confirmFulfilments,
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
								// {
								// 	descriptor: {
								// 		code: "Count",
								// 	},
								// 	value: "10",
								// },
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
								{
									descriptor: {
											code: "Package_Count"
									},
									value: "10"
							}
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
						{
							descriptor: {
								code: "BPP_Terms"
							},
							list: [
								{
									descriptor: {
										code: "Max_Liability"
									},
									value: "2"
								},
								{
									descriptor: {
										code: "Max_Liability_Cap"
									},
									value: "10000"
								},
								{
									descriptor: {
										code: "Mandatory_Arbitration"
									},
									value: "false"
								},
								{
									descriptor: {
										code: "Court_Jurisdiction"
									},
									value: "Bengaluru"
								},
								{
									descriptor: {
										code: "Delay_Interest"
									},
									value: "1000"
								},
								{
									descriptor: {
										code: "Static_Terms"
									},
									value: "https://github.com/ONDC-Official/protocol-network-extension/discussions/79"
								}
							]
						},
						{
							descriptor: {
								code: "BAP_Terms"
							},
							list: [
								{
									descriptor: {
										code: "Accept_BPP_Terms"
									},
									value: "Y"
								}
							]
						}
					],
					created_at: newTime,
					updated_at: newTime,
				},
			},
		};

		try{
			const delivery=await redis.get(`${transactionId}-deliveryType`)
			if(delivery==='surface'){
				delete confirm.message.order.billing.time
			}
		}
		catch(error){
			logger.error(error)
		}

		await send_response(res, next, confirm, transactionId, "confirm");
	} catch (error) {
		return next(error);
	}
};
