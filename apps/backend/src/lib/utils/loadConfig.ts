import YAML from "yaml";
import fs from "fs";
import path from "path";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import { OpenAPIV3 } from 'openapi-types';
import { redis } from "./redis";

export const loadConfig = () => {
	const fileContent = fs.readFileSync(
		path.join(process.cwd(), "./config/default.yaml"),
		"utf8"
	);

	console.log("INSIDE loadConfig :::", process.cwd());
	const config = YAML.parse(fileContent);
  const generalDomains = Object.keys(config.l2_validations);
  console.log("GENERAL DOMAINS", generalDomains);
  redis.set("l2_validations", JSON.stringify(generalDomains));
	// console.log("CONFIG", config);
	for (const eachDomain in config.l2_validations) {
		config.l2_validations[eachDomain].forEach(async (d: any) => {
			// console.log("D", d);
			if (d[Object.keys(d)[0]] === true) {
				let layer2ConfigFilename = `${Object.keys(d)[0]}_${d.version}.yaml`;
				let specialCharsRe = /[:\/]/gi;
				layer2ConfigFilename = layer2ConfigFilename.replace(
					specialCharsRe,
					"_"
				);
				// console.log("config file name", layer2ConfigFilename);
				const fileContent = fs.readFileSync(
					path.join(process.cwd(), `./specs/${layer2ConfigFilename}`),
					"utf8"
				);
				const layer2Config = YAML.parse(fileContent);
				// console.log("L2 Config", layer2Config);
				const options = {
					continueOnError: true, // Continue dereferencing despite errors
				};
				const dereferencedSpec = (await $RefParser.dereference(
					layer2Config,
					options
				)) as OpenAPIV3.Document;

        // console.log("DEREFERED SCHEMA", dereferencedSpec)
        // fs.writeFileSync(
				// 	path.join(__dirname, "../../../", `./specs/temp-${layer2ConfigFilename}`),
        //   JSON.stringify(dereferencedSpec, null ,2),
				// 	"utf8"
				// );
        console.log("SAVING KEY", `${eachDomain}_${Object.keys(d)[0]}_l2_validation`)
        redis.set(`${eachDomain}_${Object.keys(d)[0]}_l2_validation`, JSON.stringify(dereferencedSpec), "EX", 60 * 60 * 24);
			}
		});
	}

	return config;
};
