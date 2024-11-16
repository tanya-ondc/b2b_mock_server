import { DOMAIN, VERSION } from "./constants";

export const onSelectSchema = {
	$id: "onSelectSchema",
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
					const: "on_select",
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
									fulfillment_id: { type: "string" },
								},
								required: ["id", "fulfillment_id"],
							},
						},
						quote: {
							type: "object",
							properties: {
								ttl: { type: "string" },
								price: {
									type: "object",
									properties: {
										value: { type: "string" },
										currency: { type: "string" },
									},
									required: ["value", "currency"],
								},
								breakup: {
									type: "array",
									items: {
										type: "object",
										properties: {
											price: {
												type: "object",
												properties: {
													value: { type: "string" },
													currency: { type: "string" },
												},
												required: ["value", "currency"],
											},
											title: { type: "string" },
											"@ondc/org/item_id": { type: "string" },
											"@ondc/org/title_type": { type: "string" },
											item: {
												type: "object",
												properties: {
													price: {
														type: "object",
														properties: {
															value: { type: "string" },
															currency: { type: "string" },
														},
														required: ["value", "currency"],
													},
													quantity: {
														type: "object",
														properties: {
															maximum: {
																type: "object",
																properties: {
																	count: { type: "string" },
																},
																required: ["count"],
															},
															available: {
																type: "object",
																properties: {
																	count: { type: "string" },
																},
																required: ["count"],
															},
														},
														required: ["maximum", "available"],
													},
												},
												required: ["price", "quantity"],
											},
											"@ondc/org/item_quantity": {
												type: "object",
												properties: {
													count: { type: "integer" },
												},
												required: ["count"],
											},
										},
										required: [
											"price",
											"title",
											"@ondc/org/item_id",
											"@ondc/org/title_type",
										],
									},
								},
							},
							required: ["ttl", "price", "breakup"],
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
									type: { type: "string" },
									state: {
										type: "object",
										properties: {
											descriptor: {
												type: "object",
												properties: {
													code: { type: "string" },
												},
												required: ["code"],
											},
										},
										required: ["descriptor"],
									},
									"@ondc/org/TAT": { type: "string" },
									"@ondc/org/category": { type: "string" },
									"@ondc/org/provider_name": { type: "string" },
								},
								required: [
									"id",
									"type",
									"state",
									"@ondc/org/TAT",
									"@ondc/org/category",
									"@ondc/org/provider_name",
								],
							},
						},
					},
					required: ["items", "quote", "provider", "fulfillments"],
				},
			},
			required: ["order"],
		},
		error: {
			type: "object",
			properties: {
				code: {
					type: "string",
				},
				message: {
					type: "string",
				},
			},
			required: ["code", "message"],
		},
	},
	required: ["context", "message"],
};
