import { DOMAIN, VERSION } from "./constants";

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
				location: {
					type: "object",
					properties: {
						city: {
							type: "object",
							properties: {
								code: {
									type: "string",
								},
							},
							required: ["code"],
						},
						country: {
							type: "object",
							properties: {
								code: {
									type: "string",
								},
							},
							required: ["code"],
						},
					},
					required: ["city", "country"],
				},
				action: {
					type: "string",
					const: "select",
				},
				version: {
					type: "string",
					const: VERSION,
				},
				bap_id: {
					type: "string",
				},
				bap_uri: {
					type: "string",
				},
				bpp_id: {
					type: "string",
				},
				bpp_uri: {
					type: "string",
				},
				transaction_id: {
					type: "string",
				},
				message_id: {
					type: "string",
					allOf: [
						{
							not: {
								const: { $data: "1/transaction_id" },
							},
							errorMessage:
								"Message ID should not be equal to transaction_id: ${1/transaction_id}",
						},
					],
				},
				timestamp: {
					type: "string",
					format: "date-time",
				},
				ttl: {
					type: "string",
					const: { $data: "2/message/order/provider/ttl" },
					errorMessage:
						"should match provider ttl - ${2/message/order/provider/ttl}",
				},
			},
			required: [
				"domain",
				"location",
				"action",
				"version",
				"bap_id",
				"bap_uri",
				"bpp_id",
				"bpp_uri",
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
								ttl: {
									type: "string",
									format: "duration",
								},
							},
							required: ["id", "locations"],
							errorMessage:
								"id, locations are mandatory attributes and ttl is required for RFQ Flow",
						},
						items: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: {
										type: "string",
									},
									location_ids: {
										type: "array",
										items: {
											type: "string",
										},
									},
									fulfillment_ids: {
										type: "array",
										items: {
											type: "string",
										},
									},
									quantity: {
										type: "object",
										properties: {
											selected: {
												type: "object",
												properties: {
													count: {
														type: "integer",
													},
												},
												required: ["count"],
											},
										},
										required: ["selected"],
									},
									add_ons: {
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
									tags: {
										type: "array",
										items: {
											type: "object",
											properties: {
												descriptor: {
													type: "object",
													properties: {
														code: {
															type: "string",
															enum: ["BUYER_TERMS"],
														},
													},
													required: ["code"],
												},
												list: {
													type: "array",
													items: {
														type: "object",
														properties: {
															descriptor: {
																type: "object",
																properties: {
																	code: {
																		type: "string",
																		enum: ["ITEM_REQ", "PACKAGING_REQ"],
																	},
																},
																required: ["code"],
															},
															value: {
																type: "string",
															},
														},
														required: ["descriptor", "value"],
													},
												},
											},
											required: ["descriptor", "list"],
										},
									},
								},
								required: ["id", "location_ids", "quantity", "fulfillment_ids"],
							},
						},
						fulfillments: {
							type: "array",
							items: {
								type: "object",
								properties: {
									id: {
										type: "string",
									},
									type: {
										type: "string",
									},
									stops: {
										type: "array",
										items: {
											type: "object",
											properties: {
												type: {
													type: "string",
												},
												location: {
													type: "object",
													properties: {
														gps: {
															type: "string",
															pattern:
																"^(-?[0-9]{1,3}(?:.[0-9]{6,15})?),( )*?(-?[0-9]{1,3}(?:.[0-9]{6,15})?)$",
															errorMessage:
																"Incorrect gps value (minimum of six decimal places are required)",
														},
														area_code: {
															type: "string",
														},
													},
													required: ["gps", "area_code"],
												},
											},
											required: ["type", "location"],
										},
									},
									customer: {
										type: "object",
										properties: {
											person: {
												type: "object",
												properties: {
													creds: {
														type: "array",
														items: {
															type: "object",
															properties: {
																id: {
																	type: "string",
																},
																type: {
																	type: "string",
																	enum: [
																		"License",
																		"Badge",
																		"Permit",
																		"Certificate",
																	],
																},
																desc: {
																	type: "string",
																},
																icon: {
																	type: "string",
																},
																url: {
																	type: "string",
																	pattern:
																		"^https://[\\w.-]+(\\.[a-zA-Z]{2,})?(:[0-9]+)?(/\\S*)?$",
																},
															},
															required: ["id", "type", "desc", "url"],
														},
													},
												},
												required: ["creds"],
											},
										},
										required: ["person"],
									},
									tags: {
										type: "array",
										items: {
											type: "object",
											properties: {
												descriptor: {
													type: "object",
													properties: {
														code: {
															type: "string",
															enum: ["DELIVERY_TERMS"],
														},
													},
													required: ["code"],
												},
												list: {
													type: "array",
													items: {
														type: "object",
														properties: {
															descriptor: {
																type: "object",
																properties: {
																	code: {
																		type: "string",
																		enum: [
																			"INCOTERMS",
																			"NAMED_PLACE_OF_DELIVERY",
																		],
																	},
																},
																required: ["code"],
															},
															value: {
																type: "string",
															},
														},
														if: {
															properties: {
																descriptor: {
																	properties: { code: { const: "INCOTERMS" } },
																},
															},
														},
														then: {
															properties: {
																value: {
																	enum: [
																		"DPU",
																		"CIF",
																		"EXW",
																		"FOB",
																		"DAP",
																		"DDP",
																	],
																},
															},
														},
														required: ["descriptor", "value"],
													},
												},
											},
											required: ["descriptor", "list"],
										},
									},
								},
								additionalProperties: false,
								if: { properties: { type: { const: "Delivery" } } },
								then: { required: ["id", "type", "stops"] },
								else: { required: ["id", "type"] },
							},
						},
						payments: {
							type: "array",
							items: {
								type: "object",
								properties: {
									type: {
										type: "string",
										enum: [
											"PRE-FULFILLMENT",
											"ON-FULFILLMENT",
											"POST-FULFILLMENT",
										],
									},
								},
								required: ["type"],
							},
						},
						offers:{
							type:"object",
							properties:{
								id:{
									type:"string"
								}
							},
							required:["id"]
						},
						tags: {
							type: "array",
							items: {
								type: "object",
								properties: {
									descriptor: {
										properties: {
											code: {
												type: "string",
												enum: ["buyer_id", "COMM_CHANNEL"],
											},
										},
									},
									list: {
										type: "array",
										items: {
											type: "object",
											properties: {
												descriptor: {
													properties: {
														code: {
															type: "string",
															enum: [
																"buyer_id_code",
																"buyer_id_no",
																"chat_url",
															],
														},
													},
												},
												value: {
													type: "string",
												},
											},
											required: ["descriptor", "value"],
										},
									},
								},
								required: ["descriptor", "list"],
							},
						},
					},
					additionalProperties: false,
					required: ["provider", "items", "fulfillments", "payments"],
				},
			},
			required: ["order"],
			additionalProperties: false,
		},
	},
	required: ["context", "message"],
	additionalProperties: false,
};
