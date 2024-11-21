import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	responseBuilder,
	AGRI_EXAMPLES_PATH,
	logger,
} from "../../../lib/utils";
import { ON_ACTION_KEY } from "../../../lib/utils/actionOnActionKeys";
import { SERVICES_DOMAINS } from "../../../lib/utils/apiConstants";

export const searchController = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const domain = req?.body?.context?.domain;
		// const {scenario}=req.query
		let scenario = "incremental"
		let onSearch, file;
		const {
			message: { intent },
		} = req.body;
		const id = intent?.category?.id;

		switch (domain) {
			case SERVICES_DOMAINS.AGRI_INPUT:
				file = fs.readFileSync(
					path.join(
						AGRI_EXAMPLES_PATH,
						`on_search/${"on_search.yaml"}`
					)
				);
				break;
			default:
				file = fs.readFileSync(
					path.join(AGRI_EXAMPLES_PATH, "on_search/on_search.yaml")
				);
				break;
		}
		const response = YAML.parse(file.toString());
		switch(scenario){
			case "incremental-pull":
				response.value.message = {
					catalog: {
						"bpp/providers":[
							{
								id: response.value.message.catalog['bpp/providers'][0].id,
								time: response.value.message.catalog['bpp/providers'][0].time,
								items: response.value.message.catalog['bpp/providers'][0].items
							}]
					}
				}
				break;
			default:
				response.value={...response.value}
		}
		

		logger.info(`${JSON.stringify(response.value.message)}`)
		return responseBuilder(
			res,
			next,
			req.body.context,
			response.value.message,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_search" : "/on_search"
			}`,
			`${ON_ACTION_KEY.ON_SEARCH}`,
			"agri"
		);
	} catch (error) {
		return next(error);
	}
};
