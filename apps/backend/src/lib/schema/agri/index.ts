import { NextFunction, Request, Response } from "express";
import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { searchSchema } from "./search";
import { onSearchSchema } from "./on_search";
import { onSelectSchema } from "./on_select";
import { selectSchema } from "./select";
import { confirmSchema } from "./confirm";
import { initSchema } from "./init";
import { onConfirmSchema } from "./on_confirm";
import { onInitSchema } from "./on_init";
import { onStatusSchema } from "./on_status";
import { onUpdateSchema } from "./on_update";
import { statusSchema } from "./status";
import { updateSchema } from "./update";
import { cancelSchema } from "./cancel";
import { onCancelSchema } from "./on_cancel";

export const agriSchemaValidator =
	(
		schema:
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
			| "rating"
	) =>
	(req: Request, res: Response, next: NextFunction) => {
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
			}>,
			isValid: boolean;

		switch (schema) {
			case "search":
				validate = ajv.compile(searchSchema);
				break;
			case "on_search":
				validate = ajv.compile(onSearchSchema);
				break;
			case "select":
				validate = ajv.compile(selectSchema);
				break;
			case "on_select":
				validate = ajv.compile(onSelectSchema);
				break;
			case "init":
				validate = ajv.compile(initSchema);
				break;
			case "on_init":
				validate = ajv.compile(onInitSchema);
				break;
			case "confirm":
				validate = ajv.compile(confirmSchema);
				break;
			case "on_confirm":
				validate = ajv.compile(onConfirmSchema);
				break;
			case "status":
				validate = ajv.compile(statusSchema);
				break;
			case "on_status":
				validate = ajv.compile(onStatusSchema);
				break;
			case "update":
				validate = ajv.compile(updateSchema);
				break;
			case "on_update":
				validate = ajv.compile(onUpdateSchema);
				break;
			case "cancel":
				validate = ajv.compile(cancelSchema);
				break;
			case "on_cancel":
				validate = ajv.compile(onCancelSchema);
				break;
			default:
				res.status(400).json({
					message: {
						ack: {
							status: "NACK",
						},
					},
					error: {
						type: "JSON-SCHEMA-ERROR",
						code: "50009",
					},
				});
				return;
		}

		isValid = validate(req.body);
		// console.log('isValid::::: ', isValid)
		if (!isValid) {
			console.log("error json schema",schema,validate.errors?.map(
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
			res.status(400).json({
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
			return;
		}
		next();
	};
