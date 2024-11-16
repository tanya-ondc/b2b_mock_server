import {
	DOMAIN,
	SRV_FULFILLMENT_TYPE,
	SRV_PAYMENT_TYPE,
	VERSION,
} from "./constants";

export const onSearchSchema = {
	$id: "onSearchSchema",
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
					const: "on_search",
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
				catalog: {
					type: "object",
					properties: {
						"bpp/providers": {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: { type: "string" },
									ttl: { type: "string", pattern: "^P\\d+D$" }, // ISO 8601 duration
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
									time: {
										type: "object",
										properties: {
											label: { type: "string" },
											timestamp: { type: "string", format: "date-time" },
										},
										required: ["label", "timestamp"],
									},
									items: {
										type: "array",
										items: {
											type: "object",
											properties: {
												id: { type: "string" },
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
												time: {
													type: "object",
													properties: {
														label: { type: "string" },
														timestamp: { type: "string", format: "date-time" },
													},
													required: ["label", "timestamp"],
												},
												price: {
													type: "object",
													properties: {
														value: { type: "string" },
														currency: { type: "string" },
														maximum_value: { type: "string" },
													},
													required: ["value", "currency", "maximum_value"],
												},
												quantity: {
													type: "object",
													properties: {
														maximum: {
															type: "object",
															properties: { count: { type: "string" } },
														},
														unitized: {
															type: "object",
															properties: {
																measure: {
																	type: "object",
																	properties: {
																		unit: { type: "string" },
																		value: { type: "string" },
																	},
																	required: ["unit", "value"],
																},
															},
														},
														available: {
															type: "object",
															properties: { count: { type: "string" } },
														},
													},
													required: ["maximum", "unitized", "available"],
												},
												descriptor: {
													type: "object",
													properties: {
														name: { type: "string" },
														images: {
															type: "array",
															items: { type: "string", format: "uri" },
														},
														symbol: { type: "string", format: "uri" },
														long_desc: { type: "string" },
														short_desc: { type: "string" },
													},
													required: [
														"name",
														"images",
														"symbol",
														"long_desc",
														"short_desc",
													],
												},
												category_id: { type: "string" },
												location_id: { type: "string" },
												recommended: { type: "boolean" },
												fulfillment_id: { type: "string" },
												"@ondc/org/returnable": { type: "boolean" },
												"@ondc/org/cancellable": { type: "boolean" },
												"@ondc/org/time_to_ship": {
													type: "string",
													pattern: "^P\\d+D$",
												},
												"@ondc/org/return_window": {
													type: "string",
													pattern: "^P\\d+D$",
												},
												"@ondc/org/available_on_cod": { type: "boolean" },
												"@ondc/org/seller_pickup_return": { type: "boolean" },
												"@ondc/org/contact_details_consumer_care": {
													type: "string",
												},
											},
											required: [
												"id",
												"tags",
												"time",
												"price",
												"quantity",
												"descriptor",
												"category_id",
												"location_id",
												"recommended",
												"fulfillment_id",
												"@ondc/org/returnable",
												"@ondc/org/cancellable",
												"@ondc/org/time_to_ship",
												"@ondc/org/return_window",
												"@ondc/org/available_on_cod",
												"@ondc/org/seller_pickup_return",
												"@ondc/org/contact_details_consumer_care",
											],
										},
									},
								},
								required: ["id", "ttl", "tags", "time", "items"],
							},
						},
						"bpp/descriptor": {
							type: "object",
							properties: {
								name: { type: "string" },
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
								images: {
									type: "array",
									items: { type: "string", format: "uri" },
								},
								symbol: { type: "string", format: "uri" },
								long_desc: { type: "string" },
								short_desc: { type: "string" },
							},
							required: [
								"name",
								"tags",
								"images",
								"symbol",
								"long_desc",
								"short_desc",
							],
						},
					},
					required: ["bpp/providers", "bpp/descriptor"],
				},
			},
			required: ["catalog"],
		},
	},
	required: ["context", "message"],
};
