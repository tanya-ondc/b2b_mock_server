import { NextFunction, Request, Response } from "express";
import {
  responseBuilder,
  Fulfillment,
  B2C_EXAMPLES_PATH,
} from "../../../lib/utils";
import fs from "fs";
import path from "path";
import YAML from "yaml";

export const confirmController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scenario } = req.query;
    

    switch (scenario) {
      case "cancelled":
        confirmDomesticRejected(req, res, next);
        break;
      default:
        confirmDomesticController(req, res, next);
        break;
    }
  } catch (error) {
    return next(error);
  }
};

const confirmDomesticController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { context, message } = req.body;
    const {version}=req.query
    const start = new Date(message.order.created_at);
    start.setHours(start.getHours() + 1);
    const end = new Date(message.order.created_at);
    end.setHours(end.getHours() + 2);

    const file = fs.readFileSync(
      path.join(B2C_EXAMPLES_PATH, "on_confirm/on_confirm_exports.yaml")
    );

    const response = YAML.parse(file.toString());

    const responseMessage = {
      order: {
        ...message.order,
        items:[{
          id:message.order.items[0].id,
          fulfillment_ids:message.order.items[0].fulfillment_ids,
          quantity:message.order.items[0].quantity
        }],
        state: "Accepted",
        provider: {
          ...message.order.provider,
          rateable: true,
        },
        fulfillments: message.order.fulfillments.map(
          (eachFulfillment: Fulfillment) => ({
            ...eachFulfillment,
            "@ondc/org/provider_name":
              response.value.message.order.fulfillments[0][
                "@ondc/org/provider_name"
              ],
            state: response.value.message.order.fulfillments[0].state,
            stops: [
              ...eachFulfillment.stops,
              {
                ...response.value.message.order.fulfillments[0].stops[0],
                time: {
                  range: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                  },
                },
              },
            ],
          })
        ),
      },
    };
    return responseBuilder(
      res,
      next,
      context,
      responseMessage,
      `${req.body.context.bap_uri}${
        req.body.context.bap_uri.endsWith("/") ? "on_confirm" : "/on_confirm"
      }`,
      `on_confirm`,
      "retail"
    );
  } catch (error) {
    return next(error);
  }
};

const confirmDomesticRejected = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { context, message } = req.body;
    const start = new Date(message.order.created_at);
    start.setHours(start.getHours() + 1);
    const end = new Date(message.order.created_at);
    end.setHours(end.getHours() + 2);

    const file = fs.readFileSync(
      path.join(B2C_EXAMPLES_PATH, "on_confirm/on_confirm_exports.yaml")
    );

    const response = YAML.parse(file.toString());

    const responseMessage = {
      order: {
        ...message.order,
        state: "Accepted",
        provider: {
          ...message.order.provider,
          rateable: true,
        },
        fulfillments: message.order.fulfillments.map(
          (eachFulfillment: Fulfillment) => ({
            ...eachFulfillment,
            "@ondc/org/provider_name":
              response.value.message.order.fulfillments[0][
                "@ondc/org/provider_name"
              ],
            state: response.value.message.order.fulfillments[0].state,
            stops: [
              ...eachFulfillment.stops,
              {
                ...response.value.message.order.fulfillments[0].stops[0],
                time: {
                  range: {
                    start: start.toISOString(),
                    end: end.toISOString(),
                  },
                },
              },
            ],
          })
        ),
      },
    };
    return responseBuilder(
      res,
      next,
      context,
      responseMessage,
      `${req.body.context.bap_uri}${
        req.body.context.bap_uri.endsWith("/") ? "on_confirm" : "/on_confirm"
      }`,
      `on_confirm`,
      "retail",
      {
        type: "DOMAIN-ERROR",
        code: "30019",
        message: "PO rejected",
      }
    );
  } catch (error) {
    next(error);
  }
};
