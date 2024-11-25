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
					const: "on_select",
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
					errorMessage:
						"Transaction ID should be same across the transaction: ${/select/0/context/transaction_id}",
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
										additionalProperties: false,
										required: ["id"],
									},
								},
							},
							additionalProperties: false,
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
									// // tags: {
									// 	type: "array",
									// 	items: {
									// 		type: "object",
									// 		properties: {
									// 			descriptor: {
									// 				type: "object",
									// 				properties: {
									// 					code: {
									// 						type: "string",
									// 						enum: ["BUYER_TERMS"],
									// 					},
									// 				},
									// 				required: ["code"],
									// 			},
									// 			list: {
									// 				type: "array",
									// 				items: {
									// 					type: "object",
									// 					properties: {
									// 						descriptor: {
									// 							type: "object",
									// 							properties: {
									// 								code: {
									// 									type: "string",
									// 									enum: ["ITEM_REQ", "PACKAGING_REQ"],
									// 								},
									// 							},
									// 							required: ["code"],
									// 						},
									// 						value: {
									// 							type: "string",
									// 						},
									// 					},
									// 					required: ["descriptor", "value"],
									// 				},
									// 			},
									// 		},
									// 		required: ["descriptor", "list"],
									// 	},
									// },
								},
								required: ["id", "quantity", "fulfillment_ids"],
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
									"@ondc/org/provider_name": {
										type: "string",
									},
									tracking: {
										type: "boolean",
									},
									"@ondc/org/category": {
										type: "string",
									},
									"@ondc/org/TAT": {
										type: "string",
										format: "duration",
									},
									state: {
										type: "object",
										properties: {
											descriptor: {
												type: "object",
												properties: {
													code: {
														type: "string",
														enum: ["Serviceable", "Non-Serviceable"],
													},
												},
												required: ["code"],
											},
										},
										required: ["descriptor"],
									},
								},

								// tags: {
								// 	type: "array",
								// 	items: {
								// 		type: "object",
								// 		properties: {
								// 			descriptor: {
								// 				type: "object",
								// 				properties: {
								// 					code: {
								// 						type: "string",
								// 						enum: ["DELIVERY_TERMS"],
								// 					},
								// 				},
								// 				required: ["code"],
								// 			},
								// 			list: {
								// 				type: "array",
								// 				items: {
								// 					type: "object",
								// 					properties: {
								// 						descriptor: {
								// 							type: "object",
								// 							properties: {
								// 								code: {
								// 									type: "string",
								// 									enum: [
								// 										"INCOTERMS",
								// 										"NAMED_PLACE_OF_DELIVERY",
								// 									],
								// 								},
								// 							},
								// 							required: ["code"],
								// 						},
								// 						value: {
								// 							type: "string",
								// 						},
								// 					},
								// 					if: {
								// 						properties: {
								// 							descriptor: {
								// 								properties: { code: { const: "INCOTERMS" } },
								// 							},
								// 						},
								// 					},
								// 					then: {
								// 						properties: {
								// 							value: {
								// 								enum: [
								// 									"DPU",
								// 									"CIF",
								// 									"EXW",
								// 									"FOB",
								// 									"DAP",
								// 									"DDP",
								// 								],
								// 							},
								// 						},
								// 					},
								// 					required: ["descriptor", "value"],
								// 				},
								// 			},
								// 		},
								// 		required: ["descriptor", "list"],
								// 	},
								// },
								required: [
									"id",
									"@ondc/org/provider_name",
									"tracking",
									"@ondc/org/category",
									"@ondc/org/TAT",
									"state",
								],
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
									format: "duration",
								},
							},
							required: ["price", "breakup", "ttl"],
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
										const: { $data: "/select/0/message/order/payments/0/type" },
									},
									collected_by: {
										type: "string",
										enum: ["BAP", "BPP"],
									},
								},
								required: ["type"], // TODO
							},
						},
					},

					required: ["provider", "items", "quote", "payments", "fulfillments"],
				},
			},
			required: ["order"],
		},
	},
	required: ["context", "message"],
};
