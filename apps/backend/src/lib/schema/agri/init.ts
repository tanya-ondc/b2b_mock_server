import { DOMAIN, VERSION } from "./constants";

export const initSchema = {
	$id: "initSchema",
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
					const: "init",
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
						items: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									quantity: {
										type: "object",
										properties: {
											count: { type: "integer", minimum: 1 },
										},
										required: ["count"],
									},
									fulfillment_id: { type: "string" },
								},
								required: ["id", "quantity", "fulfillment_id"],
							},
						},
						billing: {
							type: "object",
							properties: {
								name: { type: "string" },
								phone: { type: "string", pattern: "^\\d{10}$" },
								address: {
									type: "object",
									properties: {
										city: { type: "string" },
										name: { type: "string" },
										state: { type: "string" },
										country: { type: "string", pattern: "^[A-Z]{3}$" },
										building: { type: "string" },
										locality: { type: "string" },
										area_code: { type: "string", pattern: "^\\d{6}$" },
									},
									required: [
										"city",
										"name",
										"state",
										"country",
										"building",
										"locality",
										"area_code",
									],
								},
								created_at: { type: "string", format: "date-time" },
								updated_at: { type: "string", format: "date-time" },
							},
							required: [
								"name",
								"phone",
								"address",
								"created_at",
								"updated_at",
							],
						},
						provider: {
							type: "object",
							properties: {
								id: { type: "string" },
								locations: {
									type: "array",
									items: {
										type: "object",
										properties: {
											id: { type: "string" },
										},
										required: ["id"],
									},
								},
							},
							required: ["id", "locations"],
						},
						fulfillments: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									end: {
										type: "object",
										properties: {
											person: {
												type: "object",
												properties: {
													name: { type: "string" },
												},
												required: ["name"],
											},
											contact: {
												type: "object",
												properties: {
													phone: { type: "string", pattern: "^\\d{10}$" },
												},
												required: ["phone"],
											},
											location: {
												type: "object",
												properties: {
													gps: {
														type: "string",
														pattern:
															"^-?\\d{1,3}\\.\\d+,\\s*-?\\d{1,3}\\.\\d+$",
													},
													address: {
														type: "object",
														properties: {
															city: { type: "string" },
															name: { type: "string" },
															state: { type: "string" },
															country: {
																type: "string",
																pattern: "^[A-Z]{3}$",
															},
															building: { type: "string" },
															locality: { type: "string" },
															area_code: {
																type: "string",
																pattern: "^\\d{6}$",
															},
														},
														required: [
															"city",
															"name",
															"state",
															"country",
															"building",
															"locality",
															"area_code",
														],
													},
												},
												required: ["gps", "address"],
											},
										},
										required: ["person", "contact", "location"],
									},
									type: { type: "string", enum: ["Delivery"] },
								},
								required: ["id", "end", "type"],
							},
						},
					},
					required: ["items", "billing", "provider", "fulfillments"],
				},
			},
			required: ["order"],
		},
	},
	required: ["context", "message"],
};
