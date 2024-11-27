import { NextFunction, Request, Response } from "express";
import {
	AGRI_HEALTHCARE_STATUS,
	AGRI_HEALTHCARE_STATUS_OBJECT,
	AGRI_STATUS,
	AGRI_STATUS_OBJECT,
	BID_AUCTION_STATUS,
	EQUIPMENT_HIRING_STATUS,
	FULFILLMENT_LABELS,
	ORDER_STATUS,
	SERVICES_DOMAINS,
} from "../../../lib/utils/apiConstants";
import {
	AGRI_BPP_MOCKSERVER_URL,
	Fulfillment,
	MOCKSERVER_ID,
	Stop,
	TransactionType,
	createAuthHeader,
	logger,
	redis,
	redisExistFromServer,
	redisFetchFromServer,
	responseBuilder,
	send_nack,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { ERROR_MESSAGES } from "../../../lib/utils/responseMessages";
import axios, { AxiosError } from "axios";
import { update } from "lodash";

export const statusController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let scenario: string = String(req.query.scenario) || "";
		const { transaction_id } = req.body.context;
		const on_confirm_data = await redisFetchFromServer(
			ON_ACTION_KEY.ON_CONFIRM,
			transaction_id
		);

		if (!on_confirm_data) {
			return send_nack(res, ERROR_MESSAGES.ON_CONFIRM_DOES_NOT_EXISTED);
		}

		const on_cancel_exist = await redisExistFromServer(
			ON_ACTION_KEY.ON_CANCEL,
			transaction_id
		);
		if (on_cancel_exist) {
			scenario = "cancel";
		}
		return statusRequest(req, res, next, on_confirm_data, scenario);
	} catch (error) {
		return next(error);
	}
};

const statusRequest = async (
	req: Request,
	res: Response,
	next: NextFunction,
	transaction: any,
	scenario: string
) => {
	try {
		const { context, message } = transaction;
		context.action = ON_ACTION_KEY.ON_STATUS;
		const domain = context?.domain;
		const on_status = await redisFetchFromServer(
			ON_ACTION_KEY.ON_STATUS,
			req.body.context.transaction_id
		);
		let next_status = scenario;

		if (on_status) {
			//UPDATE SCENARIO TO NEXT STATUS
			const lastStatus =
				on_status?.message?.order?.fulfillments[0]?.state?.descriptor?.code;

			//FIND NEXT STATUS
			let lastStatusIndex: any = 0;
			console.log("domainatstatusbpp", domain)
			switch (domain) {
				case SERVICES_DOMAINS.SERVICES || SERVICES_DOMAINS.AGRI_EQUIPMENT:
					lastStatusIndex = EQUIPMENT_HIRING_STATUS.indexOf(lastStatus);
					if (lastStatusIndex === 2) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < EQUIPMENT_HIRING_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = EQUIPMENT_HIRING_STATUS[nextStatusIndex];
					}
					break;
				case SERVICES_DOMAINS.BID_ACTION_SERVICES:
					lastStatusIndex = BID_AUCTION_STATUS.indexOf(lastStatus);
					if (lastStatusIndex === 1) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < BID_AUCTION_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = BID_AUCTION_STATUS[nextStatusIndex];
					}
					break;
				case SERVICES_DOMAINS.AGRI_INPUT:
					lastStatusIndex = AGRI_STATUS.indexOf(lastStatus);
					if (lastStatusIndex === 1) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < AGRI_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = AGRI_STATUS[nextStatusIndex];
					}
					break;
				default: //service started is the default case
					lastStatusIndex = AGRI_HEALTHCARE_STATUS.indexOf(lastStatus);
					if (lastStatus === 6) {
						next_status = lastStatus;
					}
					if (
						lastStatusIndex !== -1 &&
						lastStatusIndex < AGRI_HEALTHCARE_STATUS.length - 1
					) {
						const nextStatusIndex = lastStatusIndex + 1;
						next_status = AGRI_HEALTHCARE_STATUS[nextStatusIndex];
					}
					break;
			}
		}
		scenario = scenario ? scenario : next_status;
		const responseMessage: any = {
			order: {
				id: message.order.id,
				status: ORDER_STATUS.IN_PROGRESS.toUpperCase(),
				provider: {
					...message.order.provider,
					rateable: undefined,
				},
				items: message.order.items,
				billing: { ...message.order.billing, tax_id: undefined },
				fulfillments: message.order.fulfillments.map(
					(fulfillment: Fulfillment) => ({
						...fulfillment,
						id: fulfillment.id,
						state: {
							descriptor: {
								code: AGRI_HEALTHCARE_STATUS_OBJECT.IN_TRANSIT,
							},
						},
						end: fulfillment.end,
						type: "Delivery",
						start: fulfillment.start,
						// stops: fulfillment.stops.map((stop: Stop) => {
						// 	const demoObj = {
						// 		...stop,
						// 		id: undefined,
						// 		authorization: stop.authorization
						// 			? {
						// 					...stop.authorization,
						// 					status: FULFILLMENT_LABELS.CONFIRMED,
						// 			  }
						// 			: undefined,
						// 		person: stop.person ? stop.person : stop.customer?.person,
						// 	};
						// 	if (stop.type === "start") {
						// 		return {
						// 			...demoObj,
						// 			location: {
						// 				...stop.location,
						// 				descriptor: {
						// 					...stop.location?.descriptor,
						// 					images: [{ url: "https://gf-integration/images/5.png" }],
						// 				},
						// 			},
						// 		};
						// 	}
						// 	return demoObj;
						// }),
						// rateable: undefined,
					})
				),
				quote: message.order.quote,
				payments: message.order.payment,
				created_at: message.order.created_at,
				updated_at: message.order.updated_at,
			},
		};

		switch (scenario) {
			case AGRI_STATUS_OBJECT.CREATED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code = "Pending";
						// fulfillment.stops.forEach((stop: Stop) =>
						// 	stop?.authorization ? (stop.authorization = undefined) : undefined
						// );
					}
				);
				break;
			case AGRI_STATUS_OBJECT.PACKED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.PACKED;
						// fulfillment.stops.forEach((stop: Stop) =>
						// 	stop?.authorization
						// 		? (stop.authorization = {
						// 				...stop.authorization,
						// 				status: "valid",
						// 		  })
						// 		: undefined
						// );
					}
				);
				break;
			case AGRI_STATUS_OBJECT.AGENT_ASSIGNED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.AGENT_ASSIGNED;
					}
				);
				break;
			case AGRI_STATUS_OBJECT.ORDER_PICKED_UP:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.ORDER_PICKED_UP;
					}
				);
				break;
			case AGRI_STATUS_OBJECT.OUT_FOR_DELIVERY:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.OUT_FOR_DELIVERY;
						// fulfillment.stops.forEach((stop: Stop) =>
						// 	stop?.authorization ? (stop.authorization = undefined) : undefined
						// );
					}
				);
				break;
			case AGRI_STATUS_OBJECT.DELIVERED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code =
							AGRI_STATUS_OBJECT.DELIVERED;
					}
				);
				break;
				responseMessage.order.status = "Cancelled";
				break;
			default: //service started is the default case
				break;
		}


		responseBuilder(
			res,
			next,
			req.body.context,
			responseMessage,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/")
				? ON_ACTION_KEY.ON_STATUS
				: `/${ON_ACTION_KEY.ON_STATUS}`
			}`,
			`${ON_ACTION_KEY.ON_STATUS}`,
			"agri"
		);

		const createdate=new Date(message.order.created_at)
		createdate.setSeconds(createdate.getSeconds() + 10);

		const updatedate=new Date(message.order.updated_at)
		updatedate.setSeconds(updatedate.getSeconds() + 10);
		const onStatusCreated = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "Pending" // modify the code to "created"
						}
					}
				})),
				created_at:createdate.toISOString(),
				updated_at:updatedate.toISOString()

			}
		};

		createdate.setSeconds(createdate.getSeconds() + 20);
		updatedate.setSeconds(updatedate.getSeconds() + 20);

		const onStatusPacked = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "PACKED" // modify the code to "created"
						}
					}
				})),
				created_at:createdate.toISOString(),
				updated_at:updatedate.toISOString()
			}
		}

		createdate.setSeconds(createdate.getSeconds() + 30);
		updatedate.setSeconds(updatedate.getSeconds() + 30);


		const onStatusAgent_Assigned = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "AGENT_ASSIGNED" // modify the code to "created"
						}
					}
				})),
				created_at:createdate.toISOString(),
				updated_at:updatedate.toISOString()
			}
		}

		createdate.setSeconds(createdate.getSeconds() + 40);
		updatedate.setSeconds(updatedate.getSeconds() + 40);

		const onStatusOrderPickedUp = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "ORDER_PICKED_UP" // modify the code to "created"
						}
					}
				})),
				created_at:createdate.toISOString(),
				updated_at:updatedate.toISOString()
			}
		}

		createdate.setSeconds(createdate.getSeconds() + 50);
		updatedate.setSeconds(updatedate.getSeconds() + 50);


		const onStatusOrderOutForDelivery = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "ORDER_OUT_FOR_DELIVERY" // modify the code to "created"
						}
					}
				})),
				created_at:createdate.toISOString(),
				updated_at:updatedate.toISOString()
			}
		}

		createdate.setSeconds(createdate.getSeconds() + 60);
		updatedate.setSeconds(updatedate.getSeconds() + 60);

		const onStatusOrderDelivered = {
			...responseMessage, // spread the entire response
			order: {
				...responseMessage.order, // spread message to retain its content
				fulfillments: responseMessage.order.fulfillments.map((fulfillment: any) => ({
					...fulfillment, // spread the fulfillment object
					state: {
						...fulfillment.state, // spread state to retain other state details
						descriptor: {
							...fulfillment.state.descriptor, // spread descriptor to modify only the code
							code: "DELIVERED" // modify the code to "created"
						}
					}
				})),
				created_at:createdate.toISOString(),
				updated_at:updatedate.toISOString()
			}
		}

		// let i = 1;
		// let interval = setInterval(async () => {
		// 	if (i >= 2) {
		// 		clearInterval(interval);
		// 	}
		// 	// context.message_id = uuidv4();
		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusCreated,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/")
		// 				? "on_status"
		// 				: "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusPacked,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusAgent_Assigned,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusOrderPickedUp,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusOrderOutForDelivery,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);

		// 	await childOrderResponseBuilder(
		// 		i,
		// 		res,
		// 		context,
		// 		onStatusOrderDelivered,
		// 		`${req.body.context.bap_uri}${
		// 			req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		// 		}`,
		// 		"on_status"
		// 	);
		// 	i++;
		// }, 1000);


		let i = 0; // Start with 1
		const maxRequests = 5; // Set the number of requests you want to make

		// Create an async function to handle sending the requests
		async function sendRequests() {
			// Send the requests one after another
			try {
				// First request (onStatusCreated)
				// await childOrderResponseBuilder(
				// 	i,
				// 	res,
				// 	context,
				// 	onStatusCreated,
				// 	`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
				// 	}`,
				// 	"on_status"
				// );

				// Second request (onStatusPacked)
				 // Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusPacked,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Third request (onStatusAgent_Assigned)
				 // Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusAgent_Assigned,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Fourth request (onStatusOrderPickedUp)
				 // Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderPickedUp,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Fifth request (onStatusOrderOutForDelivery)
				 // Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderOutForDelivery,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				// Sixth request (onStatusOrderDelivered)
				// Increment for the next request
				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderDelivered,
					`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

			} catch (error) {
				// If any request fails, catch the error and log it
				console.error("Error occurred while sending requests:", error);
			}
		}

		// Call the function once to send all the requests
		sendRequests();


	} catch (error) {
		next(error);
	}
};

export const childOrderResponseBuilder = async (
	id: number,
	res: Response,
	reqContext: object,
	message: object,
	uri: string,
	action: string,
	error?: object | undefined
) => {
	let ts = new Date();

	const sandboxMode = res.getHeader("mode") === "sandbox";

	let async: { message: object; context?: object; error?: object } = {
		context: {},
		message,
	};
	const bppURI = AGRI_BPP_MOCKSERVER_URL;
	async = {
		...async,
		context: {
			...reqContext,
			bpp_id: MOCKSERVER_ID,
			bpp_uri: bppURI,
			timestamp: ts.toISOString(),
			action: action,
		},
	};

	if (error) {
		async = { ...async, error };
	}

	const header = await createAuthHeader(async);
	if (sandboxMode) {
		var log: TransactionType = {
			request: async,
		};
		console.log("urI sent at on_status", uri)
		try {
			const response = await axios.post(uri + "?mode=mock", async,
				// 	{
				// 	headers: {
				// 		authorization: header,
				// 	},
				// }
			);

			log.response = {
				timestamp: new Date().toISOString(),
				response: response.data,
			};

			await redis.set(
				`${(async.context! as any).transaction_id}-${action}-from-server-${id}-${ts.toISOString()}`, // saving ID with on_status child process (duplicate keys are not allowed)
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
				`${(async.context! as any).transaction_id}-${action}-from-server-${id}-${ts.toISOString()}`,
				JSON.stringify(log)
			);

			if (error instanceof AxiosError && id === 0 && action === "on_status") {
				res.status(error.status || 500).json(error);
			}

			if (error instanceof AxiosError) {
				console.log(error.response?.data);
			}

			throw error;
		}

		logger.info({
			type: "response",
			action: action,
			transaction_id: (reqContext as any).transaction_id,
			message: { sync: { message: { ack: { status: "ACK" } } } },
		});

		console.log(`Subscription Child Process (action: ${action}) ${id} : `, {
			message: {
				ack: {
					status: "ACK",
				},
			},
		});
		return;
	} else {
		logger.info({
			type: "response",
			action: action,
			transaction_id: (reqContext as any).transaction_id,
			message: { sync: { message: { ack: { status: "ACK" } } } },
		});

		console.log(`Subscription Child Process (action: ${action}) ${id} : `, {
			sync: {
				message: {
					ack: {
						status: "ACK",
					},
				},
			},
			async,
		});
		return;
	}
};