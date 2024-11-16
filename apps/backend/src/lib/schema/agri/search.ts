import {
	SRV_FULFILLMENT_TYPE,
	GPS_PATTERN,
	SRV_PAYMENT_TYPE,
	PAYMENT_COLLECTEDBY,
	DOMAIN,
	VERSION,
	SRV_INTENT_TAGS,
} from "./constants";

export const searchSchema = {
	$id: "searchSchema",
	type: "object",
	properties: {
		context: {
			type: "object",
			properties: {
				domain: {
					type: "string",
					enum: DOMAIN,
				},
				country: {
					type: "string",
					const: "IND",
				},
        city: {
					type: "string",
				},
				action: {
					type: "string",
					const: "search",
				},
				core_version: {
					type: "string",
					const: VERSION,
				},
				bap_id: {
					type: "string",
				},
				bap_uri: {
					type: "string",
				},
				transaction_id: {
					type: "string",
				},
				message_id: {
					type: "string",
				},
				timestamp: {
					type: "string",
					format: "date-time",
				},
				ttl: {
					type: "string",
					const: "PT30S",
				},
			},
			required: [
				"domain",
				"country",
        "city",
				"action",
				"core_version",
				"bap_id",
				"bap_uri",
				"transaction_id",
				"message_id",
				"timestamp",
				"ttl",
			],
		},
		message: {
			type: "object",
			properties: {
				intent: {
					type: "object",
					properties: {
						payment: {
							type: "object",
							properties: {
								"@ondc/org/buyer_app_finder_fee_type": {
									type: "string",
									enum: ["percent", "absolute"], // Add enums if applicable.
								},
								"@ondc/org/buyer_app_finder_fee_amount": {
									type: "string", // Use "number" if this should be numeric.
									pattern: "^[0-9]+(\\.[0-9]{1,2})?$", // Optional validation for decimal amounts.
								},
							},
							required: [
								"@ondc/org/buyer_app_finder_fee_type",
								"@ondc/org/buyer_app_finder_fee_amount",
							],
						},
						fulfillment: {
							type: "object",
							properties: {
								type: {
									type: "string",
									enum: ["Delivery", "Self-Pickup"], // Add relevant fulfillment types.
								},
							},
							required: ["type"],
						},
					},
					required: ["payment", "fulfillment"], // Adjust required fields.
				},
			},
			required: ["intent"],
		},
	},
	required: ["context", "message"],
};
