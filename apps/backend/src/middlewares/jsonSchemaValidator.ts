import { b2bSchemaValidator } from "../lib/schema/b2b";
import { srvSchemaValidator } from "../lib/schema/services";
import { subscriptionSchemaValidator } from "../lib/schema/subscription";
import { logisticsSchemaValidator } from "../lib/schema/logistics";
import { b2cSchemaValidator } from "../lib/schema/b2c";
import { retailSchemaValidator } from "../lib/schema/retail";
import { version } from "os";

type AllActions =
	| "search"
	| "on_search"
	| "select"
	| "on_select"
	| "init"
	| "on_init"
	| "confirm"
	| "on_confirm"
	| "status"
	| "on_status"
	| "update"
	| "on_update"
	| "track"
	| "on_track"
	| "cancel"
	| "on_cancel"
	| "rating";

// Exclude "select", "on_select", and "rating" for logistics domain
type LogisticsActions = Exclude<AllActions, "select" | "on_select" | "rating">;

type B2BActions = Exclude<AllActions, "rating">;
type B2CActions = Exclude<AllActions, "rating">;



type Domain =
	| "b2b"
	| "b2c"
	| "services"
	| "logistics"
	| "retail"
	| "subscription";

type ActionType<T extends Domain> = T extends "logistics"
	? LogisticsActions
	:AllActions;

export type VersionType = 'b2b' | 'b2c'; // Include '1235' if it's a valid option


type JsonSchemaValidatorType<T extends Domain> = {
	domain: T;
	action: ActionType<T>;
	VERSION?:VersionType|undefined
};

export const jsonSchemaValidator = <T extends Domain>({
	domain,
	action,
	VERSION
}: JsonSchemaValidatorType<T>) => {
	if(domain==='retail' && VERSION==='b2b'){
		console.log("b2b")
		return b2bSchemaValidator(action as AllActions);
	}
	else if(domain==='retail' && VERSION==='b2c'){
		console.log("b2c")
		return b2cSchemaValidator(action as AllActions);
	}
	else{
		switch (domain) {			
			case "services":
				return srvSchemaValidator(action as AllActions);
			case "retail":
				return retailSchemaValidator(action as AllActions);
			case "subscription":
				return subscriptionSchemaValidator(action as AllActions);
			case "logistics":
				return logisticsSchemaValidator(action as LogisticsActions);
			default:
				throw new Error(`Unsupported domain: ${domain}`);
		}

	}
};
