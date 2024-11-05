import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH,
	AGRI_SERVICES_EXAMPLES_PATH,
	BID_AUCTION_SERVICES_EXAMPLES_PATH,
	HEALTHCARE_SERVICES_EXAMPLES_PATH,
	responseBuilder,
	SERVICES_EXAMPLES_PATH,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";

export const searchController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const domain = req.body.context.domain;
		let onSearch, file;
		const {
			message: { intent },
		} = req.body;
		const id = intent?.category?.id;

		switch (domain) {
			case SERVICES_DOMAINS.SERVICES:
				file = fs.readFileSync(
					path.join(
						SERVICES_EXAMPLES_PATH,
						// `on_search/${"on_search_customized.yaml"}`
						`on_search/${
							id === "SRV11-1041"
								?
								"on_search_customized.yaml"
								: "on_search.yaml"
						}`
					)
				);
				break;

			case SERVICES_DOMAINS.HEALTHCARE_SERVICES:
				file = fs.readFileSync(
					path.join(
						HEALTHCARE_SERVICES_EXAMPLES_PATH,
						`on_search/${"on_search.yaml"}`
					)
				);
				break;

			case SERVICES_DOMAINS.AGRI_EQUIPMENT:
				file = fs.readFileSync(
					path.join(
						AGRI_EQUIPMENT_HIRING_EXAMPLES_PATH,
						"on_search/on_search.yaml"
					)
				);
				break;
			case SERVICES_DOMAINS.AGRI_SERVICES:
				file = fs.readFileSync(
					path.join(
						AGRI_SERVICES_EXAMPLES_PATH,
						`on_search/${
							id === "SRV14:1004" ||
							req.body.message?.intent?.item?.descriptor?.name !==
								"Soil Testing"
								? "on_search_assaying.yaml"
								: "on_search.yaml"
						}`
					)
				);
				break;
			case SERVICES_DOMAINS.BID_ACTION_SERVICES:
				file = fs.readFileSync(
					path.join(
						BID_AUCTION_SERVICES_EXAMPLES_PATH,
						`on_search/on_search.yaml`
					)
				);
				break;
			default:
				file = fs.readFileSync(
					path.join(SERVICES_EXAMPLES_PATH, "on_search/on_search.yaml")
				);
				break;
		}
		const response = YAML.parse(file.toString());
		console.log("ON SEARCH RESPONSE HOLIDAYS: ", response.value.message.catalog.providers[0].items[1].time.schedule.holidays);
		// fs.writeFileSync("temp-on_search.json", JSON.stringify(response.value.message, null, 2));
		return responseBuilder(
			res,
			next,
			req.body.context,
			response.value.message,
			`${req.body.context.bap_uri}${
				req.body.context.bap_uri.endsWith("/") ? "on_search" : "/on_search"
			}`,
			`${ON_ACTION_KEY.ON_SEARCH}`,
			"services"
		);
	} catch (error) {
		return next(error);
	}
};
