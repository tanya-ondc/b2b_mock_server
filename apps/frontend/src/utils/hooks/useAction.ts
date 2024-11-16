import * as _ from "lodash";
import { useState } from "react";
import {
	B2B_SCENARIOS,
	SERVICES_SCENARIOS,
	NEXT_ACTION,
	HEALTHCARE_SERVICES_SCENARIOS,
	AGRI_SERVICES_SCENARIOS,
	AGRI_EQUIPMENT_SERVICES_SCENARIOS,
	BID_AUCTION_SCENARIOS,
	LOGISTICS_SCENARIOS,
	NEXT_ACTION_LOGISTICS,
	B2C_SCENARIOS,
	PRINT_MEDIA_SCENARIOS,
} from "openapi-specs/constants";
import { LOGISTICS_DOMAINS_OBJECT, SERVICES_DOMAINS } from "../constants";
// import { ALL_DOMAINS_FRONTEND } from "../constants";

export const useAction = () => {
	const [action, setAction] = useState<string>();
	const [domain, setDomain] = useState<string>("");
	const [logError, setLogError] = useState(false);

	const [scenarios, setScenarios] =
		useState<{ name: string; scenario?: string }[]>();

	const detectAction = _.debounce((log: string, version?: string) => {
		try {
			const parsedLog = JSON.parse(log);
			//DETACT DOMAIN FROM PAYLOAD
			const servicesDomain = parsedLog?.context?.domain;
			//DETACT DOMAIN
			const allScenarios =
				servicesDomain === SERVICES_DOMAINS.SERVICE
					? SERVICES_SCENARIOS
					: servicesDomain === SERVICES_DOMAINS.HEALTHCARE_SERVICES
					? HEALTHCARE_SERVICES_SCENARIOS
					: servicesDomain === SERVICES_DOMAINS.AGRI_SERVICES
					? AGRI_SERVICES_SCENARIOS
					: servicesDomain === SERVICES_DOMAINS.EQUIPMENT_HIRING_SERVICES
					? AGRI_EQUIPMENT_SERVICES_SCENARIOS
					: servicesDomain === SERVICES_DOMAINS.BID_AUCTION_SERVICE
					? BID_AUCTION_SCENARIOS
					: servicesDomain === SERVICES_DOMAINS.PRINT_MEDIA
					? PRINT_MEDIA_SCENARIOS
					: servicesDomain === LOGISTICS_DOMAINS_OBJECT.DOMESTIC ||
					  servicesDomain === LOGISTICS_DOMAINS_OBJECT.INTERNATIONAL
					? LOGISTICS_SCENARIOS
					: version === "b2b"
					? B2B_SCENARIOS
					: version === "b2c"?
					B2C_SCENARIOS
					: [];
			if (!parsedLog.context!.action) setLogError(true);
			const parsedAction = parsedLog.context.action;
			setAction(parsedAction);

			// Choose the appropriate action mapping based on the domain
			const actionMapping =
				domain.toLowerCase() === "logistics"
					? NEXT_ACTION_LOGISTICS
					: NEXT_ACTION;
			const scenarioKey = Object.keys(allScenarios).find(
				(key) =>
					key === actionMapping[parsedAction as keyof typeof actionMapping]
			);
			if (scenarioKey) {
				setScenarios(allScenarios[scenarioKey as keyof typeof allScenarios]);
			} else {
				setScenarios([]);
			}

			setLogError(false);
		} catch (error) {
			setLogError(true);
			setAction(undefined);
		}
	}, 1500);
	return { action, domain, setDomain, logError, scenarios, detectAction,setLogError };
};
