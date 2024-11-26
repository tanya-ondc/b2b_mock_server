import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import YAML from "yaml";
import {
	B2B_EXAMPLES_PATH,
	B2C_EXAMPLES_PATH,
	logger,
	redis,
	responseBuilder,
	VERSION,
} from "../../../lib/utils";

export const searchController = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {

		const { domain, transaction_id, action, location } = req.body.context;
		// console.log("🚀 ~ city:", location.city.code)
		const message = req.body.message;
		let { version } = req.body;

		//TODO need to check std code for b2b exports

		const buyerIdTag = message.intent.tags.find(
			(tag: any) => tag.descriptor.code === "buyer_id"
		);


		if (buyerIdTag) {
			const buyerIdNo = buyerIdTag.list.find(
				(item: any) => item.descriptor.code === "buyer_id_no"
			);

			if (buyerIdNo && buyerIdNo.value) {
				if (location.city.code.toLowerCase() == "std:999" || location.city.code.toLowerCase() == "un:sin") {
					logger.info("buyer id number is present , it is b2b exp");

					version = VERSION["b2bexports"]
				} else {
					logger.info("buyer id number is present , it is b2b");
					version = VERSION["b2b"];

				}

			} else version = VERSION["b2c"];
		} else {
			version = VERSION["b2c"];
		}

		// console.log("🚀 ~ version:", version);

		try {
			console.log("abs", `${transaction_id}-version`,version)
			await redis.set(
				`${transaction_id}-version`, version);
		} catch (err: any) {
		}

		var onSearch;

		if (version === VERSION["b2c"]) {
			switch (domain) {
				case "ONDC:RET12":
					var file = fs.readFileSync(
						path.join(B2C_EXAMPLES_PATH, "on_search/on_search_fashion.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET10":
					var file = fs.readFileSync(
						path.join(B2C_EXAMPLES_PATH, "on_search/on_search_grocery.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
				default:
					var file = fs.readFileSync(
						path.join(B2C_EXAMPLES_PATH, "on_search/on_search_fashion.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
			}
		} else {
			//TODO : switch countries in serviceability in case on exports
			switch (domain) {
				case "ONDC:RET1A":
					var file = fs.readFileSync(
						path.join(
							B2B_EXAMPLES_PATH,
							"on_search/on_search_autoparts_and_components.yaml"
						)
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET13":
					var file = fs.readFileSync(
						path.join(B2B_EXAMPLES_PATH, "on_search/on_search_bpc.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET1D":
					var file = fs.readFileSync(
						path.join(B2B_EXAMPLES_PATH, "on_search/on_search_chemicals.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET1C":
					var file = fs.readFileSync(
						path.join(
							B2B_EXAMPLES_PATH,
							"on_search/on_search_construction_and_building.yaml"
						)
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET14":
					var file = fs.readFileSync(
						path.join(
							B2B_EXAMPLES_PATH,
							"on_search/on_search_electronics_mobile.yaml"
						)
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET12":
					var file = fs.readFileSync(
						path.join(B2B_EXAMPLES_PATH, "on_search/on_search_fashion.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET10":
					var file = fs.readFileSync(
						path.join(B2B_EXAMPLES_PATH, "on_search/on_search_grocery.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
				case "ONDC:RET1B":
					var file = fs.readFileSync(
						path.join(
							B2B_EXAMPLES_PATH,
							"on_search/on_search_hardware_and_industrial.yaml"
						)
					);
					onSearch = YAML.parse(file.toString());
					break;
				default:
					var file = fs.readFileSync(
						path.join(B2B_EXAMPLES_PATH, "on_search/on_search.yaml")
					);
					onSearch = YAML.parse(file.toString());
					break;
				}
			}
			
			if (version = VERSION['b2bexports']) {
			// console.log("🚀 ~ onSearch:", onSearch.value.message?.catalog)
			const abc = onSearch.value.message?.catalog?.providers[0].tags.map((tag: any) => {

				// console.log('tag', tag.descriptor.code)
				if (tag.descriptor.code == 'serviceability') {
					tag.list.map((taggroup: any) => {
						if (taggroup.descriptor.code == "val") {
							taggroup.value = 'SGP'
						}
						return taggroup
					})
				}
				return tag
			})
			// console.log("🚀 ~ abc ~ abc:", JSON.stringify(abc))
		}

		return responseBuilder(
			res,
			next,
			req.body.context,
			onSearch.value.message,
			`${req.body.context.bap_uri}${req.body.context.bap_uri.endsWith("/") ? "on_search" : "/on_search"
			}`,
			`on_search`,
			"retail"
		);
	} catch (error) {
		return next(error);
	}
};
