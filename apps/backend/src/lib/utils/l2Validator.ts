
import { NextFunction, Request, Response } from "express";
import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { redis } from "./redis";

export const l2Validator = (domain: string) => async (req: Request, res: Response, next: NextFunction) => {
  console.log("URL ::", req.url, req.originalUrl, req.hostname)
  const url = new URL(`https://www.google.com${req.originalUrl}`)
  const action = url.pathname.split("/")[url.pathname.split("/").length - 1]

  const {domain: reqDomain} = req.body.context;
  console.log("REQ Context", req.body.context)
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    strictRequired: false,
    strictTypes: false,
    $data: true,
  });
  addFormats(ajv);

  require("ajv-errors")(ajv);
  var validate: ValidateFunction<{
      [x: string]: {};
    } | unknown>,
    isValid: boolean;
  console.log("ACTION and REQ DOMAIN", action, reqDomain)

  const specString = await redis.get(`${domain}_${(reqDomain as string).toLowerCase().replace(":", "_")}_l2_validation`);
  const spec = JSON.parse(specString as string);
  const actionSchema = spec['paths'][`/${action}`]['post']['requestBody']['content']['application/json']['schema']
  console.log("ACTION SCHEMA", actionSchema)
  validate = ajv.compile(actionSchema as object);


  isValid = validate(req.body);
  // console.log('isValid::::: ', isValid)
  if (!isValid) {
    console.log("error json schema",action,validate.errors?.map(
      ({ message, params, instancePath }) => ({
        message: `${message}${
          params.allowedValues ? ` (${params.allowedValues})` : ""
        }${params.allowedValue ? ` (${params.allowedValue})` : ""}${
          params.additionalProperty
            ? ` (${params.additionalProperty})`
            : ""
        }`,
        details: instancePath,
      })
    ),)
    return res.status(400).json({
      message: {
        ack: {
          status: "NACK",
        },
      },
      error: {
        type: "JSON-SCHEMA-ERROR",
        code: "50009",
        message: validate.errors?.map(
          ({ message, params, instancePath }) => ({
            message: `${message}${
              params.allowedValues ? ` (${params.allowedValues})` : ""
            }${params.allowedValue ? ` (${params.allowedValue})` : ""}${
              params.additionalProperty
                ? ` (${params.additionalProperty})`
                : ""
            }`,
            details: instancePath,
          })
        ),
      },
    });
  }
  next();
}
