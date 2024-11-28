import { DOMAIN, VERSION } from "./constants";

export const onInitSchema = {
	$id: "onInitSchema",
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
					const: "on_init",
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
						tags: {
							type: "array",
							items: {
								type: "object",
								properties: {
									code: { type: "string" },
									list: {
										type: "array",
										items: {
											type: "object",
											properties: {
												code: { type: "string" },
												value: { type: "string" },
											},
											required: ["code", "value"],
										},
									},
								},
								required: ["code", "list"],
							},
						},
						items: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									quantity: {
										type: "object",
										properties: {
											count: { type: "integer" },
										},
										required: ["count"],
									},
									fulfillment_id: { type: "string" },
								},
								required: ["id", "quantity", "fulfillment_id"],
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
											"@ondc/org/item_quantity": {
												type: "object",
												properties: {
													count: { type: "integer" },
												},
											},
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
															},
															available: {
																type: "object",
																properties: {
																	count: { type: "string" },
																},
															},
														},
													},
												},
											},
										},
										required: ["price", "title"],
									},
								},
							},
							required: ["ttl", "price", "breakup"],
						},
						billing: {
							type: "object",
							properties: {
								name: { type: "string" },
								phone: { type: "string" },
								address: {
									type: "object",
									properties: {
										city: { type: "string" },
										name: { type: "string" },
										state: { type: "string" },
										country: { type: "string" },
										building: { type: "string" },
										locality: { type: "string" },
										area_code: { type: "string" },
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
						payment: {
							type: "object",
							properties: {
								type: { type: "string" },
								status: { type: "string" },
								"@ondc/org/settlement_basis": { type: "string" },
								"@ondc/org/settlement_window": { type: "string" },
								"@ondc/org/withholding_amount": { type: "string" },
								"@ondc/org/buyer_app_finder_fee_type": { type: "string" },
								"@ondc/org/buyer_app_finder_fee_amount": { type: "string" },
							},
							required: ["type", "status"],
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
													phone: { type: "string" },
												},
												required: ["phone"],
											},
											location: {
												type: "object",
												properties: {
													gps: { type: "string" },
													address: {
														type: "object",
														properties: {
															city: { type: "string" },
															name: { type: "string" },
															state: { type: "string" },
															country: { type: "string" },
															building: { type: "string" },
															locality: { type: "string" },
															area_code: { type: "string" },
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
									type: { type: "string" },
								},
								required: ["id", "end", "type"],
							},
						},
					},
					required: [
						"tags",
						"items",
						"quote",
						"billing",
						"payment",
						"provider",
						"fulfillments",
					],
				},
			},
			required: ["order"],
		},
	},
	required: ["context", "message"],
};
