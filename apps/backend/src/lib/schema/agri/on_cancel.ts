import { DOMAIN, VERSION } from "./constants";

export const onCancelSchema = {
  $id: "onCancelSchema",
  type: "object",
  properties: {
    context: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          enum: DOMAIN
        },
        // location: {
        //   type: "object",
        //   properties: {
        //     city: {
        //       type: "object",
        //       properties: {
        //         code: {
        //           type: "string",
        //         },
        //       },
        //       required: ["code"],
        //     },
        //     country: {
        //       type: "object",
        //       properties: {
        //         code: {
        //           type: "string",
        //         },
        //       },
        //       required: ["code"],
        //     },
        //   },
        //   required: ["city", "country"],
        // },
        action: {
          type: "string",
          const: "on_cancel",
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
        },
        ttl: {
          type: "string",
        },
      },
      required: [
        "domain",
        "action",
        "core_version",
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
            status: {
              type: "string",
              enum: ["CANCELLED"],
            },
            cancellation: {
              type: "object",
              properties: {
                reason: {
                  type: "object",
                  properties: {
                    descriptor: {
                      properties: {
                        code: {
                          type: "string",
                        },
                      },
                      required: ["code"],
                    },
                  },
                  required: ["descriptor"],
                },
                cancelled_by: {
                  type: "string",
                },
              },
              required: ["reason", "cancelled_by"],
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
                  // parent_item_id: {
                  //   type: "string",
                  // },
                  fulfillment_id: {
                    type: "string",
                  },
                  quantity: {
                    type: "object",
                    properties: {
                      count: {
                        type: "integer",
                        // properties: {
                        //   count: {
                        //     type: "integer",
                        //   },
                        // },
                        // required: ["count"],
                      },
                      // measure: {
                      //   type: "object",
                      //   properties: {
                      //     unit: {
                      //       type: "string",
                      //     },
                      //     value: {
                      //       type: "string",
                      //     },
                      //   },
                      //   required: ["unit", "value"],
                      // },
                    },
                    required: ["count"],
                  },
                },
                required: [
                  "id",
                  "fulfillment_id",
                  "quantity",
                ],
              },
            },
            billing: {
              type: "object",
              properties: {
                name: {
                  type: "string"
                },
                phone: {
                  type: "string"
                },
                address: {
                  type: "object",
                  properties: {
                    city: {
                      type: "string"
                    },
                    name: {
                      type: "string"
                    },
                    state: {
                      type: "string"
                    },
                    country: {
                      type: "string"
                    },
                    building: {
                      type: "string"
                    },
                    locality: {
                      type: "string"
                    },
                    area_code: {
                      type: "string"
                    }
                  },
                  required: [
                    "city",
                    "name",
                    "state",
                    "country",
                    "building",
                    "locality",
                    "area_code"
                  ]
                }
              },
              required: [
                "name",
                "phone",
                "address"
              ]
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
                      time: {
                        type: "object",
                        properties: {
                          range: {
                            type: "object",
                            properties: {
                              end: { type: "string"},
                              start: { type: "string" }
                            },
                            required: ["end", "start"]
                          }
                        },
                        required: ["range"]
                      },
                      person: {
                        type: "object",
                        properties: {
                          name: { type: "string" }
                        },
                        required: ["name"]
                      },
                      contact: {
                        type: "object",
                        properties: {
                          phone: { type: "string" }
                        },
                        required: ["phone"]
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
                              area_code: { type: "string" }
                            },
                            required: [
                              "city",
                              "name",
                              "state",
                              "country",
                              "building",
                              "locality",
                              "area_code"
                            ]
                          }
                        },
                        required: ["gps", "address"]
                      }
                    },
                    required: ["time", "person", "contact", "location"]
                  },
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
                              value: { type: "string" }
                            },
                            required: ["code", "value"]
                          }
                        }
                      },
                      required: ["code", "list"]
                    }
                  },
                  type: { type: "string" },
                  start: {
                    type: "object",
                    properties: {
                      time: {
                        type: "object",
                        properties: {
                          range: {
                            type: "object",
                            properties: {
                              end: { type: "string"  },
                              start: { type: "string"}
                            },
                            required: ["end", "start"]
                          }
                        },
                        required: ["range"]
                      },
                      contact: {
                        type: "object",
                        properties: {
                          email: { type: "string", format: "email" },
                          phone: { type: "string" }
                        },
                        required: ["email", "phone"]
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
                              area_code: { type: "string" }
                            },
                            required: [
                              "city",
                              "name",
                              "state",
                              "country",
                              "building",
                              "locality",
                              "area_code"
                            ]
                          },
                          descriptor: {
                            type: "object",
                            properties: {
                              name: { type: "string" }
                            },
                            required: ["name"]
                          }
                        },
                        required: ["gps", "address", "descriptor"]
                      }
                    },
                    required: ["time", "contact", "location"]
                  },
                  state: {
                    type: "object",
                    properties: {
                      descriptor: {
                        type: "object",
                        properties: {
                          code: { type: "string" }
                        },
                        required: ["code"]
                      }
                    },
                    required: ["descriptor"]
                  },
                  "@ondc/org/TAT": { type: "string" },
                  "@ondc/org/category": { type: "string" },
                  "@ondc/org/provider_name": { type: "string" }
                },
                required: ["id", "type", "state", "tags"]
              }
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
                      title: {
                        type: "string",
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
                      // item: {
                      //   type: "object",
                      //   properties: {
                      //     id: {
                      //       type: "string",
                      //     },
                      //     quantity: {
                      //       type: "object",
                      //       properties: {
                      //         selected: {
                      //           type: "object",
                      //           properties: {
                      //             count: {
                      //               type: "integer",
                      //             },
                      //           },
                      //           required: ["count"],
                      //         },
                      //       },
                      //     },
                      //     price: {
                      //       type: "object",
                      //       properties: {
                      //         currency: {
                      //           type: "string",
                      //         },
                      //         value: {
                      //           type: "string",
                      //         },
                      //       },
                      //       required: ["currency", "value"],
                      //     },
                      //   },
                      //   required: ["id", "quantity", "price"],
                      // },
                      // tags: {
                      //   type: "array",
                      //   items: {
                      //     type: "object",
                      //     properties: {
                      //       descriptor: {
                      //         type: "object",
                      //         properties: {
                      //           code: {
                      //             type: "string",
                      //           },
                      //         },
                      //         required: ["code"],
                      //       },
                      //       list: {
                      //         type: "array",
                      //         items: {
                      //           type: "object",
                      //           properties: {
                      //             descriptor: {
                      //               type: "object",
                      //               properties: {
                      //                 code: {
                      //                   type: "string",
                      //                 },
                      //               },
                      //               required: ["code"],
                      //             },
                      //             value: {
                      //               type: "string",
                      //             },
                      //           },
                      //           required: ["descriptor"],
                      //         },
                      //       },
                      //     },
                      //     required: ["descriptor", "list"],
                      //   },
                      // },
                    },
                    required: ["title", "price"],
                  },
                },
                ttl: {
                  type: "string",
                },
              },
              required: ["price", "breakup", "ttl"],
            },
            payment: {
              type: "object",
              properties: {
                type: { type: "string" },
                params: {
                  type: "object",
                  properties: {
                    amount: { type: "string" },
                    currency: { type: "string" }
                  },
                  required: ["amount", "currency"]
                },
                status: { type: "string" },
                collected_by: { type: "string" },
                "@ondc/org/settlement_basis": { type: "string" },
                "@ondc/org/settlement_window": { type: "string" },
                "@ondc/org/settlement_details": {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      bank_name: { type: "string" },
                      branch_name: { type: "string" },
                      settlement_type: { type: "string" },
                      beneficiary_name: { type: "string" },
                      settlement_phase: { type: "string" },
                      settlement_ifsc_code: { type: "string" },
                      settlement_counterparty: { type: "string" },
                      settlement_bank_account_no: { type: "string" }
                    },
                    required: [
                      "bank_name",
                      "branch_name",
                      "settlement_type",
                      "beneficiary_name",
                      "settlement_phase",
                      "settlement_ifsc_code",
                      "settlement_counterparty",
                      "settlement_bank_account_no"
                    ]
                  }
                },
                "@ondc/org/withholding_amount": { type: "string" },
                "@ondc/org/buyer_app_finder_fee_type": { type: "string" },
                "@ondc/org/buyer_app_finder_fee_amount": { type: "string" }
              },
              required: [
                "type",
                "params",
                "status",
                "collected_by",
                "@ondc/org/settlement_basis",
                "@ondc/org/settlement_window",
                "@ondc/org/settlement_details",
                "@ondc/org/withholding_amount",
                "@ondc/org/buyer_app_finder_fee_type",
                "@ondc/org/buyer_app_finder_fee_amount"
              ]
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
            "status",
            "provider",
            "items",
            "billing",
            "fulfillments",
            "quote",
            "payments",
            "updated_at",
          ],
        },
      },
      required: ["order"],
    },
  },
  required: ["context", "message"],
};