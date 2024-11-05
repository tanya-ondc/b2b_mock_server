import { b2bSchemaValidator } from "../lib/schema/b2b";
import { srvSchemaValidator } from "../lib/schema/services";
import { subscriptionSchemaValidator } from "../lib/schema/subscription";
import { logisticsSchemaValidator } from "../lib/schema/logistics";
import { b2cSchemaValidator } from "../lib/schema/b2c";
import { retailSchemaValidator } from "../lib/schema/retail";
import { l2Validator, redis } from "../lib/utils";
import { NextFunction, Request, Response } from "express";

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
	: AllActions;

export type VersionType = "b2b" | "b2c"; // Include '1235' if it's a valid option

type JsonSchemaValidatorType<T extends Domain> = {
	domain: T;
	action: ActionType<T>;
	VERSION?: VersionType | undefined;
};

export const jsonSchemaValidator = <T extends Domain>({
  domain,
  action,
  VERSION,
}: JsonSchemaValidatorType<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const l2 = await redis.get("l2_validations");
      if (l2 != null && JSON.parse(l2).includes(domain)) {
        return l2Validator(domain)(req, res, next);
      }

      switch (domain) {
        case "services":
          return srvSchemaValidator(action as AllActions)(req, res, next);
        case "retail":
          if (VERSION === "b2b") {
            return b2bSchemaValidator(action as AllActions)(req, res, next);
          } else if (VERSION === "b2c") {
            return b2cSchemaValidator(action as AllActions)(req, res, next);
          } else {
            return b2cSchemaValidator(action as AllActions)(req, res, next);
          }
        case "subscription":
          return subscriptionSchemaValidator(action as AllActions)(req, res, next);
        case "logistics":
          return logisticsSchemaValidator(action as LogisticsActions)(req, res, next);
        default:
          throw new Error(`Unsupported domain: ${domain}`);
      }
    } catch (error) {
      next(error);
    }
  };
};

