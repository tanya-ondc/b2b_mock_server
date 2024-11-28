import { NextFunction, Request, Response } from "express";
import {
	MOCKSERVER_ID,
	send_response,
	B2C_EXAMPLES_PATH,
	B2C_BAP_MOCKSERVER_URL,
	B2B_EXAMPLES_PATH,
	RETAIL_BAP_MOCKSERVER_URL,
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import { v4 as uuidv4 } from "uuid";

export const initiateSearchController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		let { bpp_uri, city, domain, version } = req.body;
		let file: any = "";
		switch (version) {
			case "b2c":
				file = fs.readFileSync(
					path.join(B2C_EXAMPLES_PATH, "search/search_by_item.yaml")
				);
			case "b2b":
				//Check if its exports or domestics
				if (city == "std:999") {
					version = "b2b-exp"
				}
				file = fs.readFileSync(
					path.join(B2B_EXAMPLES_PATH, "search/search_by_category.yaml")
				);
		}

		let search = YAML.parse(file.toString());
		search = search.value;
		const transaction_id = uuidv4();
		search = {
			...search,
			context: {
				...search.context,
				timestamp: new Date().toISOString(),
				location: {
					...search.context.location,
					city: {
						code: city,
					},
				},
				transaction_id,
				message_id: uuidv4(),
				domain,
				bap_id: MOCKSERVER_ID,
				bap_uri: RETAIL_BAP_MOCKSERVER_URL,
			},
		};
		search.bpp_uri = bpp_uri;
		await send_response(res, next, search, transaction_id, "search", "", version);
	} catch (error) {
		return next(error);
	}
};
