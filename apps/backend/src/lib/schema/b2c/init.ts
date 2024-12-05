import { B2B_BPP_TERMS, DOMAIN, TERMS, VERSION } from "./constants";

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
					const: "init",
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
							additionalProperties: false,
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
									minLength: 3,
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
								created_at: {
									type: "string",
								},
								updated_at: {
									type: "string",
								},
							},
							additionalProperties: false,
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
													},
													required: ["phone"],
												},
											},
											required: ["type", "location", "contact"],
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
															required: ["id", "type", "desc", "icon", "url"],
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
								required: ["id", "type", "stops"],
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
					},
					additionalProperties: true,
					required: [
						"provider",
						"items",
						"billing",
						"fulfillments",
						"payments",
					],
				},
			},
			required: ["order"],
		},
	},
	required: ["context", "message"],
};
