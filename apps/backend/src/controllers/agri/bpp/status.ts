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
			console.log("domainatstatusbpp",domain)
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
		console.log("message.order",JSON.stringify(message.order))
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
						end:fulfillment.end,
						type:"Delivery",
						start:fulfillment.start,
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

		// switch (scenario) {
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.IN_TRANSIT:
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.IN_TRANSIT;
		// 				// fulfillment.stops.forEach((stop: Stop) =>
		// 				// 	stop?.authorization ? (stop.authorization = undefined) : undefined
		// 				// );
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.AT_LOCATION:
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.AT_LOCATION;
		// 				// fulfillment.stops.forEach((stop: Stop) =>
		// 				// 	stop?.authorization
		// 				// 		? (stop.authorization = {
		// 				// 				...stop.authorization,
		// 				// 				status: "valid",
		// 				// 		  })
		// 				// 		: undefined
		// 				// );
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.COLLECTED_BY_AGENT:
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.COLLECTED_BY_AGENT;
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.RECEIVED_AT_LAB:
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.RECEIVED_AT_LAB;
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.TEST_COMPLETED:
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.TEST_COMPLETED;
		// 				fulfillment.stops.forEach((stop: Stop) =>
		// 					stop?.authorization ? (stop.authorization = undefined) : undefined
		// 				);
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_GENERATED:
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_GENERATED;
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_SHARED:
		// 		responseMessage.order.status = AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED;
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_SHARED;
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED:
		// 		responseMessage.order.status = AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED;
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.REPORT_SHARED;
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.PLACED:
		// 		// responseMessage.order.status = AGRI_HEALTHCARE_STATUS_OBJECT.COMPLETED;
		// 		responseMessage.order.fulfillments.forEach(
		// 			(fulfillment: Fulfillment) => {
		// 				fulfillment.state.descriptor.code =
		// 					AGRI_HEALTHCARE_STATUS_OBJECT.PLACED;
		// 			}
		// 		);
		// 		break;
		// 	case AGRI_HEALTHCARE_STATUS_OBJECT.CANCEL:
		// 		responseMessage.order.status = "Cancelled";
		// 		break;
		// 	default: //service started is the default case
		// 		break;
		// }
		switch (scenario) {
			case AGRI_STATUS_OBJECT.CREATED:
				responseMessage.order.fulfillments.forEach(
					(fulfillment: Fulfillment) => {
						fulfillment.state.descriptor.code ="Pending";
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
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/")
					? ON_ACTION_KEY.ON_STATUS
					: `/${ON_ACTION_KEY.ON_STATUS}`
			}`,
			`${ON_ACTION_KEY.ON_STATUS}`,
			"agri"
		);

		const onStatusCreated = {
			...responseMessage, // spread the entire response
			message: {
			  ...responseMessage.message, // spread message to retain its content
			  fulfillments: responseMessage.message.fulfillments.map((fulfillment:any) => ({
				...fulfillment, // spread the fulfillment object
				state: {
				  ...fulfillment.state, // spread state to retain other state details
				  descriptor: {
					...fulfillment.state.descriptor, // spread descriptor to modify only the code
					code: "Pending" // modify the code to "created"
				  }
				}
			  }))
			}
		  };
		const onStatusPacked={
			...responseMessage, // spread the entire response
			message: {
			  ...responseMessage.message, // spread message to retain its content
			  fulfillments: responseMessage.message.fulfillments.map((fulfillment:any) => ({
				...fulfillment, // spread the fulfillment object
				state: {
				  ...fulfillment.state, // spread state to retain other state details
				  descriptor: {
					...fulfillment.state.descriptor, // spread descriptor to modify only the code
					code: "PACKED" // modify the code to "created"
				  }
				}
			  }))
			}
		}
		const onStatusAgent_Assigned={
			...responseMessage, // spread the entire response
			message: {
			  ...responseMessage.message, // spread message to retain its content
			  fulfillments: responseMessage.message.fulfillments.map((fulfillment:any) => ({
				...fulfillment, // spread the fulfillment object
				state: {
				  ...fulfillment.state, // spread state to retain other state details
				  descriptor: {
					...fulfillment.state.descriptor, // spread descriptor to modify only the code
					code: "AGENT_ASSIGNED" // modify the code to "created"
				  }
				}
			  }))
			}
		}
		const onStatusOrderPickedUp={
			...responseMessage, // spread the entire response
			message: {
			  ...responseMessage.message, // spread message to retain its content
			  fulfillments: responseMessage.message.fulfillments.map((fulfillment:any) => ({
				...fulfillment, // spread the fulfillment object
				state: {
				  ...fulfillment.state, // spread state to retain other state details
				  descriptor: {
					...fulfillment.state.descriptor, // spread descriptor to modify only the code
					code: "ORDER_PICKED_UP" // modify the code to "created"
				  }
				}
			  }))
			}
		}
		const onStatusOrderOutForDelivery={
			...responseMessage, // spread the entire response
			message: {
			  ...responseMessage.message, // spread message to retain its content
			  fulfillments: responseMessage.message.fulfillments.map((fulfillment:any) => ({
				...fulfillment, // spread the fulfillment object
				state: {
				  ...fulfillment.state, // spread state to retain other state details
				  descriptor: {
					...fulfillment.state.descriptor, // spread descriptor to modify only the code
					code: "ORDER_OUT_FOR_DELIVERY" // modify the code to "created"
				  }
				}
			  }))
			}
		}
		const onStatusOrderDelivered={
			...responseMessage, // spread the entire response
			message: {
			  ...responseMessage.message, // spread message to retain its content
			  fulfillments: responseMessage.message.fulfillments.map((fulfillment:any) => ({
				...fulfillment, // spread the fulfillment object
				state: {
				  ...fulfillment.state, // spread state to retain other state details
				  descriptor: {
					...fulfillment.state.descriptor, // spread descriptor to modify only the code
					code: "DELIVERED" // modify the code to "created"
				  }
				}
			  }))
			}
		}
		
		let i = 1;
			let interval = setInterval(async () => {
				if (i >= 6) {
					clearInterval(interval);
				}
				// context.message_id = uuidv4();
				childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusCreated,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/")
							? "on_status"
							: "/on_status"
					}`,
					"on_status"
				);

				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusPacked,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusAgent_Assigned,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderPickedUp,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderOutForDelivery,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);

				await childOrderResponseBuilder(
					i,
					res,
					context,
					onStatusOrderDelivered,
					`${req.body.context.bap_uri}${
						req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
					}`,
					"on_status"
				);
				i++;
			}, 1000);

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

		try {
			const response = await axios.post(uri + "?mode=mock", async, {
				headers: {
					authorization: header,
				},
			});

			log.response = {
				timestamp: new Date().toISOString(),
				response: response.data,
			};

			await redis.set(
				`${(async.context! as any).transaction_id}-${action}-from-server-${id}-${ts.toISOString()}`, // saving ID with on_confirm child process (duplicate keys are not allowed)
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

			if (error instanceof AxiosError && id === 0 && action === "on_confirm") {
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