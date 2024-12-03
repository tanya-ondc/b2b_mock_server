import { B2B_BPP_TERMS, TERMS, DOMAIN, VERSION } from "./constants";
export const confirmSchema = {
	$id: "confirmSchema",
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
					const: "confirm",
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
						id: {
							type: "string",
						},
						state: {
							type: "string",
							enum: ["Created"],
						},
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
								required: ["id", "fulfillment_ids", "quantity"],
							},
						},
						billing: {
							type: "object",
							properties: {
								name: {
									type: "string",
								},
								address: {
									type: "string",
								},
								state: {
									type: "object",
									properties: {
										name: {
											type: "string",
										},
									},
									required: ["name"],
								},
								city: {
									type: "object",
									properties: {
										name: {
											type: "string",
										},
									},
									required: ["name"],
								},
								tax_id: {
									type: "string",
								},
								email: {
									type: "string",
								},
								phone: {
									type: "string",
								},
							},
							required: ["name", "address", "state", "city", "tax_id", "phone"],
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
									tracking: {
										type: "boolean",
									},
									stops: {
										type: "array",
										items: {
											type: "object",
											properties: {
												type: {
													type: "string",
													enum: ["start", "end"],
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
														address: {
															type: "string",
														},
														city: {
															type: "object",
															properties: {
																name: {
																	type: "string",
																},
															},
															required: ["name"],
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
														area_code: {
															type: "string",
														},
														state: {
															type: "object",
															properties: {
																name: {
																	type: "string",
																},
															},
															required: ["name"],
														},
													},
													required: [
														"gps",
														"address",
														"city",
														"country",
														"area_code",
														"state",
													],
												},
												contact: {
													type: "object",
													properties: {
														phone: {
															type: "string",
														},
														email: {
															type: "string",
														},
													},
													required: ["phone"], // email will be compulsory here
												},
												customer: {
													type: "object",
													properties: {
														person: {
															type: "object",
															properties: {
																name: {
																	type: "string",
																},
															},
															required: ["name"],
														},
													},
													required: ["person"],
												},
											},
											required: ["type", "location", "contact"],
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
								required: ["id", "type", "stops"],
							},
						},
						quote: {
							type: "object",
							properties: {
								price: {
									type: "object",
									properties: {
										currency: {
											type: "string",
										},
										value: {
											type: "string",
										},
									},
									required: ["currency", "value"],
								},
								breakup: {
									type: "array",
									items: {
										type: "object",
										properties: {
											"@ondc/org/item_id": {
												type: "string",
											},
											"@ondc/org/item_quantity": {
												type: "object",
												properties: {
													count: {
														type: "integer",
													},
												},
												required: ["count"],
											},
											title: {
												type: "string",
											},
											"@ondc/org/title_type": {
												type: "string",
												enum: [
													"item",
													"delivery",
													"packing",
													"tax",
													"discount",
													"misc",
												],
											},
											price: {
												type: "object",
												properties: {
													currency: {
														type: "string",
													},
													value: {
														type: "string",
													},
												},
												required: ["currency", "value"],
											},
											item: {
												type: "object",
												properties: {
													price: {
														type: "object",
														properties: {
															currency: {
																type: "string",
															},
															value: {
																type: "string",
															},
														},
														required: ["currency", "value"],
													},
												},
												required: ["price"],
											},
										},
										if: {
											properties: {
												"@ondc/org/title_type": {
													const: "item",
												},
											},
										},
										then: {
											required: [
												"@ondc/org/item_id",
												"@ondc/org/item_quantity",
												"title",
												"@ondc/org/title_type",
												"price",
												"item",
											],
										},
										else: {
											properties: {
												"@ondc/org/title_type": {
													enum: [
														"delivery",
														"packing",
														"tax",
														"discount",
														"misc",
													],
												},
											},
											required: [
												"@ondc/org/item_id",
												"title",
												"@ondc/org/title_type",
												"price",
											],
										},
									},
								},
								ttl: {
									type: "string",
								},
							},
							required: ["price", "breakup", "ttl"],
						},
						payments: {
							type: "array",
							items: {
								type: "object",
								properties: {
									params: {
										type: "object",
										properties: {
											currency: {
												type: "string",
											},
											transaction_id: {
												type: "string",
											},
											amount: {
												type: "string",
											},
										},
										required: ["currency", "amount"],
									},
									status: {
										type: "string",
										enum: ["PAID", "NOT-PAID"],
									},
									type: {
										type: "string",
										enum: [
											"PRE-FULFILLMENT",
											"ON-FULFILLMENT",
											"POST-FULFILLMENT",
										],
									},
									collected_by: {
										type: "string",
									},
									"@ondc/org/buyer_app_finder_fee_type": {
										type: "string",
									},
									"@ondc/org/buyer_app_finder_fee_amount": {
										type: "string",
									},
									"@ondc/org/settlement_basis": {
										type: "string",
									},
									"@ondc/org/settlement_window": {
										type: "string",
									},
									"@ondc/org/withholding_amount": {
										type: "string",
									},
									"@ondc/org/settlement_details": {
										type: "array",
										items: {
											type: "object",
											properties: {
												settlement_counterparty: {
													type: "string",
													enum: ["seller-app", "buyer-app"],
												},
												settlement_phase: {
													type: "string",
												},
												settlement_type: {
													type: "string",
													enum: ["upi", "neft", "rtgs"],
												},
												upi_address: {
													type: "string",
												},
												settlement_bank_account_no: {
													type: "string",
												},
												settlement_ifsc_code: {
													type: "string",
												},
												beneficiary_name: {
													type: "string",
												},
												bank_name: {
													type: "string",
												},
												branch_name: {
													type: "string",
												},
											},
											allOf: [
												{
													if: {
														properties: {
															settlement_type: {
																const: "upi",
															},
														},
													},
													then: {
														required: ["upi_address"],
													},
												},
												{
													if: {
														properties: {
															settlement_type: {
																const: ["neft", "rtgs"],
															},
														},
													},
													then: {
														required: [
															"settlement_ifsc_code",
															"settlement_bank_account_no",
														],
													},
												},
											],
											required: ["settlement_counterparty", "settlement_type"],
										},
									},
								},
								if: { properties: { collected_by: { const: "BPP" } } },
								then: {
									required: [
										"params",
										"status",
										"type",
										"collected_by",
										"@ondc/org/buyer_app_finder_fee_type",
										"@ondc/org/buyer_app_finder_fee_amount",
										"@ondc/org/settlement_basis",
										"@ondc/org/settlement_window",
										"@ondc/org/withholding_amount",
										"@ondc/org/settlement_details",
									],
								},
								else: {
									required: [
										"params",
										"status",
										"type",
										"collected_by",
										"@ondc/org/buyer_app_finder_fee_type",
										"@ondc/org/buyer_app_finder_fee_amount",
										"@ondc/org/settlement_basis",
										"@ondc/org/settlement_window",
										"@ondc/org/withholding_amount",
									],
								},
							},
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
												enum: TERMS,
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
															enum: B2B_BPP_TERMS,
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
						created_at: {
							type: "string",
						},
						updated_at: {
							type: "string",
						},
					},
					required: [
						"id",
						"state",
						"provider",
						"items",
						"billing",
						"fulfillments",
						"quote",
						"payments",
						"created_at",
						"updated_at",
						"tags",
					],
				},
			},
			required: ["order"],
		},
	},
	required: ["context", "message"],
};
