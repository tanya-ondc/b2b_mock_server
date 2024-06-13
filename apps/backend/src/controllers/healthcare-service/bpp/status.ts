import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { HEALTHCARE_SERVICES_BAP_MOCKSERVER_URL, HEALTHCARE_SERVICES_EXAMPLES_PATH, MOCKSERVER_ID, redisFetch, responseBuilder, send_nack } from "../../../lib/utils";


export const statusController = async (req: Request, res: Response, next: NextFunction) => {
	const { scenario } = req.query;
	const on_confirm = await redisFetch("on_confirm", req.body.context.transaction_id);
	if (!on_confirm) {
		send_nack(res, "On Confirm doesn't exist")
	}
	req.body.on_confirm = on_confirm;
	switch (scenario) {
		case 'completed':
			statusCompletedController(req, res, next)
			break;
		case 'in-transit':
			statusInTransitController(req, res, next)
			break;
		case 'reached-re-otp':
			statusReachedReOtpController(req, res, next)
			break;
		case 'reached':
			statusReachedController(req, res, next)
			break;
		case 'service-started':
			// if (checkIfCustomized(req.body.message.providers[0].items)) {
			// 	return onSelectServiceCustomizedController(req, res);
			// }
			statusServiceStartedController(req, res, next)
			break;
		default:
			statusCompletedController(req, res, next)//default senario : completed
			// await automatTrigStatusWith30SecInterval(req, res, next);
			break;
	}
}

const statusCompletedController = (req: Request, res: Response, next: NextFunction) => {
	const { context, message, on_confirm } = req.body;
	const file = fs.readFileSync(
		path.join(HEALTHCARE_SERVICES_EXAMPLES_PATH, "on_status/on_status_report_shared.yaml")
	);
	const response = YAML.parse(file.toString());
	const timestamp = new Date().toISOString();

	const status = {
		context: {
			...context,
			timestamp: new Date().toISOString(),
			action: "on_status",
			bap_id: MOCKSERVER_ID,
			bap_uri: HEALTHCARE_SERVICES_BAP_MOCKSERVER_URL,
			message_id: uuidv4()
		},
		message: {
			order: {
				...response.value.message.order,
				id: on_confirm.message.order.id,
				status: response.value.message.order.status,
				provider: on_confirm.message.order.provider,
				items: on_confirm.message.order.items,
				fulfillments: response.value.message.order.fulfillments,
				quote: on_confirm.message.order.quote,
				payments: [
					{
						...on_confirm.message.order.payments[0],
						params: {
							...on_confirm.message.order.payments[0].params,
							transaction_id: uuidv4(),
						},
						status: "PAID",
					},
				],
				document: response.value.message.order.document,
				created_at: timestamp,
				updated_at: timestamp,
			},
		},
	};

	return responseBuilder(
		res,
		next,
		context,
		status.message,
		`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		}`,
		`on_status`,
		"healthcare-service"
	);
};


const statusInTransitController = (req: Request, res: Response, next: NextFunction) => {
	const { context } = req.body;
	const file = fs.readFileSync(
		path.join(HEALTHCARE_SERVICES_EXAMPLES_PATH, "on_status/on_status_In_Transit.yaml")
	);
	const response = YAML.parse(file.toString());
	return responseBuilder(
		res,
		next,
		context,
		response.value.message,
		`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		}`,
		`on_status`,
		"healthcare-service"
	);
};

const statusReachedReOtpController = (req: Request, res: Response, next: NextFunction) => {
	const { context } = req.body;
	const file = fs.readFileSync(
		path.join(HEALTHCARE_SERVICES_EXAMPLES_PATH, "on_status/on_status_Reached_re-otp.yaml")
	);
	const response = YAML.parse(file.toString());
	return responseBuilder(
		res,
		next,
		context,
		response.value.message,
		`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		}`,
		`on_status`,
		"healthcare-service"
	);
};

const statusReachedController = (
	req: Request,
	res: Response,
	next: NextFunction

) => {
	const { context } = req.body;
	const file = fs.readFileSync(
		path.join(HEALTHCARE_SERVICES_EXAMPLES_PATH, "on_status/on_status_Reached.yaml")
	);
	const response = YAML.parse(file.toString());
	return responseBuilder(
		res,
		next,
		context,
		response.value.message,
		`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		}`,
		`on_status`,
		"healthcare-service"
	);
};

const statusServiceStartedController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { context } = req.body;
	const file = fs.readFileSync(
		path.join(HEALTHCARE_SERVICES_EXAMPLES_PATH, "on_status/on_status_Service_Started.yaml")
	);
	const response = YAML.parse(file.toString());
	return responseBuilder(
		res,
		next,
		context,
		response.value.message,
		`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_status" : "/on_status"
		}`,
		`on_status`,
		"healthcare-service"
	);
};

let statusQueue: string[] = []; // Queue to hold URLs

// Function to check the status of a single API
async function checkStatus(data: any, url: any) {
	try {
		const { context, message, on_confirm } = data;
		const file = fs.readFileSync(
			path.join(HEALTHCARE_SERVICES_EXAMPLES_PATH, url)
		);
		const response = YAML.parse(file.toString());
		const timestamp = new Date().toISOString();

		const constYamlStatus = response.value.message.order.status;
		const status = {
			context: {
				...context,
				timestamp: new Date().toISOString(),
				action: "on_status",
				bap_id: MOCKSERVER_ID,
				bap_uri: HEALTHCARE_SERVICES_BAP_MOCKSERVER_URL,
				message_id: uuidv4()
			},
			message: {
				order: {
					...response.value.message.order,
					id: on_confirm.message.order.id,
					status: response.value.message.order.status,
					provider: on_confirm.message.order.provider,
					items: on_confirm.message.order.items,
					fulfillments: response.value.message.order.fulfillments,
					quote: on_confirm.message.order.quote,
					payments: [
						{
							...on_confirm.message.order.payments[0],
							params: {
								...on_confirm.message.order.payments[0].params,
								transaction_id: uuidv4(),
							},
							status: "PAID",
						},
					],
					document: response.value.message.order.document,
					created_at: timestamp,
					updated_at: timestamp,
				},
			},
		};
		console.log("urllllllllll",url,)
		return status;
	} catch (error) {
		console.error(`Error fetching constYamlStatus from:`, error);
		throw error;
	}
}

// Function to process the next URL in the queue
async function processNextUrl(req: Request, res: Response, next: NextFunction) {
	const url = statusQueue.shift(); // Get the next URL from the queue
	if (!url) {
		// If there are no more URLs in the queue, call next() to move to the next middleware
		next();
		return;
	}

	try {
		const status = await checkStatus(req.body, url);
		res.json(status); // Send the response for this URL
	} catch (error) {
		console.error("Error processing URL:", url, error);
		res.status(500).json({ error: "An error occurred while processing the request" });
	}
}

// Automatically triggered status with 30 seconds gap
const automatTrigStatusWith30SecInterval = async (req: Request, res: Response, next: NextFunction) => {
	const { context, message, on_confirm } = req.body;

	// List of status API URLs
	const statusApiUrls = [
		"on_status/on_status_transit.yaml",
		"on_status/on_status_at_location.yaml",
		"on_status/on_status_collected_by_agent.yaml",
		"on_status/on_status_received_at_lab.yaml",
		"on_status/on_status_test_completed.yaml",
		"on_status/on_status_report_generated.yaml",
		"on_status/on_status_report_shared.yaml"
	];

	// Add URLs to the queue
	statusApiUrls.forEach((url) => {
		statusQueue.push(url);
	});

	// Process the queue
	processNextUrl(req, res, next);
};

