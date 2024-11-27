import { b2bSchemaValidator } from "../lib/schema/b2b";
import { srvSchemaValidator } from "../lib/schema/services";
import { subscriptionSchemaValidator } from "../lib/schema/subscription";
import { logisticsSchemaValidator } from "../lib/schema/logistics";
import { b2cSchemaValidator } from "../lib/schema/b2c";
import { l2Validator, redis } from "../lib/utils";
import { NextFunction, Request, Response } from "express";
import { agriSchemaValidator } from "../lib/schema/agri";

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
  | "subscription"
  | "agri";

type ActionType<T extends Domain> = T extends "logistics"
  ? LogisticsActions
  : AllActions;

export type VersionType = "b2b" | "b2c" | "b2b-exp"; // Include '1235' if it's a valid option

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
      // console.log("domain at jsonSchema",domain)
      if (l2 != null && JSON.parse(l2).includes(domain)) {
        return l2Validator(domain)(req, res, next);
      }

      let savedVersion: VersionType | any = await redis.get(
        `${req.body.context.transaction_id}-version`);


      if (!savedVersion) {
        savedVersion = VERSION
      }




      switch (domain) {
        case "services":
          return srvSchemaValidator(action as AllActions)(req, res, next);
        case "retail":
          if (savedVersion === "b2b" || savedVersion === "b2b-exp") {

            return b2bSchemaValidator(action as AllActions)(req, res, next);
          } else if (savedVersion === "b2c") {

            return b2cSchemaValidator(action as AllActions)(req, res, next);
          } else {
            return b2cSchemaValidator(action as AllActions)(req, res, next);
          }
        case "subscription":
          return subscriptionSchemaValidator(action as AllActions)(req, res, next);
        case "logistics":
          return logisticsSchemaValidator(action as LogisticsActions)(req, res, next);
        case "agri":
          return agriSchemaValidator(action as AllActions)(req, res, next);
        default:
          throw new Error(`Unsupported domain: ${domain}`);
      }
    } catch (error) {
      next(error);
    }
  };
};

