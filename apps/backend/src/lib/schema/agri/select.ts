import { DOMAIN, SRV_PAYMENT_TYPE, VERSION } from "./constants";

export const selectSchema = {
	$id: "selectSchema",
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
					const: "select",
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
				order: {
					type: "object",
					properties: {
						provider: {
							type: "object",
							properties: {
								id: {
									type: "string",
								},
								locations: {
									type: "array",
									items: {
										type: "object",
										properties: {
											id: {
												type: "string",
											},
										},
										required: ["id"],
									},
								},
							},
							required: ["id", "locations"],
						},
						items: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: {
										type: "string",
									},
									location_id: {
										type: "string",
									},
									quantity: {
										type: "object",
										properties: {
											selected: {
												type: "object",
												properties: {
													count: {
														type: "number",
													},
												},
											},
										},
									},
								},
								required: ["id", "location_id", "quantity"],
							},
						},
						fulfillments: {
							type: "array",
							items: {
								type: "object",
								properties: {
									end: {
										type: "object",
										properties: {
											location: {
												type: "object",
												properties: {
													gps: { type: "string" },
													address: {
														type: "object",
														properties: {
															area_code: { type: "string" },
														},
														required: ["area_code"],
													},
												},
												required: ["gps", "address"],
											},
										},
										required: ["location"],
									},
								},
								required: ["end"],
							},
						},
						payments: {
							type: "object",
							properties: {
								type: {
									type: "string",
									enum: SRV_PAYMENT_TYPE,
								},
							},
							required: ["type"],
						},
					},
					required: ["provider", "items", "fulfillments", "payments"],
				},
			},
			required: ["order"],
		},
	},
	required: ["context", "message"],
};
