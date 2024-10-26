import { NextFunction, Request, Response } from "express";
import {
	LOGISTICS_BAP_MOCKSERVER_URL,
	LOGISTICS_EXAMPLES_PATH,
	MOCKSERVER_ID,
	send_response,
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { v4 as uuidv4 } from "uuid";


const getFutureDates = (days: number): string[] => {
	const dates: string[] = [];
	const today = new Date();

	for (let i = 0; i < days; i++) {
		const futureDate = new Date(today);
		futureDate.setDate(today.getDate() + 4 + i);

		const year = futureDate.getFullYear();
		const month = String(futureDate.getMonth() + 1).padStart(2, "0");
		const day = String(futureDate.getDate()).padStart(2, "0");

		dates.push(`${year}-${month}-${day}`);
	}

	return dates;
};

export const initiateSearchController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { bpp_uri, city, domain } = req.body;
		var search;
		switch (domain) {
			case "ONDC:LOG10":
				var file = fs.readFileSync(
					path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/search/search_without_category.yaml"
					)
				);
				search = YAML.parse(file.toString());
				break;
			case "ONDC:LOG11":
				var file = fs.readFileSync(
					path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Int_Logistics_yaml/search/search_by_air_delivery.yaml"
					)
				);
				search = YAML.parse(file.toString());
				break;
			default:
				var file = fs.readFileSync(
					path.join(
						LOGISTICS_EXAMPLES_PATH,
						"/B2B_Dom_Logistics_yaml/search/search_by_air_delivery.yaml"
					)
				);
				search = YAML.parse(file.toString());
				break;
		}
		const transaction_id = uuidv4();
		var newTime = new Date().toISOString();
		var startTime = new Date();
		startTime.setDate(startTime.getDate() + 1);
		var endTime = new Date();
		endTime.setDate(endTime.getDate() + 2);
		search = search.value;
		console.log("searchhhh",JSON.stringify(search.message.intent.fulfillment.stops[0]))
		search = {
			...search,
			context: {
				...search.context,
				timestamp: newTime,
				location: {
					...search.context.location,
					city: {
						code: city,
					},
				},
				transaction_id,
				message_id: uuidv4(),
				// bpp_id: MOCKSERVER_ID,
				domain,
				bap_id: MOCKSERVER_ID,
				bap_uri: LOGISTICS_BAP_MOCKSERVER_URL,
			},
			message: {
				intent: {
					category: search.message.intent.category,
					provider: {
						...search.message.intent.provider,
						time: {
							days: search.message.intent.provider.time.days,
							schedule: {
								holidays: getFutureDates(2),
							},
							range: search.message.intent.provider.time.range,
						},
					},
					fulfillment: {
						...search.message.intent.fulfillment,
						stops: [
							{

								...search.message.intent?.fulfillment?.stops[0],
								time: {
									range: {
										start: startTime.toISOString(),
										end: endTime.toISOString(),
									},
								},
							},
							{						
							...search.message.intent?.fulfillment?.stops[1],
							},
						],
					},
					payment: search.message.intent.payment,
					tags: search.message.intent.tags,
				},
			},
		};
		console.log("Seaaavvvvvvh",JSON.stringify(search))
		await send_response(res, next, search, transaction_id, "search", "","", bpp_uri);
	} catch (error) {
		return next(error);
	}
};
