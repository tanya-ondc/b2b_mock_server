import { AGRI_FULFILLMENT_STATE, AGRI_INPUT_STATE, DOMAIN, SRV_FULFILLMENT_STATE, SRV_ORDER_STATE, VERSION } from "./constants";

export const onStatusSchema = {
  $id: "onStatusSchema",
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
        city: {
          type: "string",
        },
        action: {
          type: "string",
          const: "on_status",
        },
        core_version: {
          type: "string",
          const: VERSION
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
        },
      },
      required: [
        "domain",
        // "location",
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
              enum: AGRI_INPUT_STATE,
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
                  parent_item_id: {
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
                      count: {
                        type: "integer",

                      },
                    },
                    required: ["count"],
                  },
                },
                required: [
                  "id",
                  // "parent_item_id",
                  // "fulfillment_ids",
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
            }
            ,
            fulfillments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string"
                  },
                  end: {
                    type: "object",
                    properties: {
                      time: {
                        type: "object",
                        properties: {
                          range: {
                            type: "object",
                            properties: {
                              start: {
                                type: "string",
                                format: "date-time"
                              },
                              end: {
                                type: "string",
                                format: "date-time"
                              }
                            }
                          }
                        }
                      },
                      person: {
                        type: "object",
                        properties: {
                          name: {
                            type: "string"
                          }
                        }
                      },
                      contact: {
                        type: "object",
                        properties: {
                          phone: {
                            type: "string"
                          }
                        }
                      },
                      location: {
                        type: "object",
                        properties: {
                          gps: {
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
                            }
                          }
                        }
                      }
                    }
                  },
                  start: {
                    type: "object"
                  },
                  state: {
                    type: "object"
                  }
                }
              }
            },
            quote: {
              type: "object",
              properties: {
                ttl: {
                  type: "string"
                },
                price: {
                  type: "object",
                  properties: {
                    value: {
                      type: "string"
                    },
                    currency: {
                      type: "string"
                    }
                  },
                  required: [
                    "value",
                    "currency"
                  ]
                },
                breakup: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item: {
                        type: "object",
                        properties: {
                          price: {
                            type: "object",
                            properties: {
                              value: {
                                type: "string"
                              },
                              currency: {
                                type: "string"
                              }
                            },
                            required: [
                              "value",
                              "currency"
                            ]
                          }
                        }
                      },
                      price: {
                        type: "object",
                        properties: {
                          value: {
                            type: "string"
                          },
                          currency: {
                            type: "string"
                          }
                        },
                        required: [
                          "value",
                          "currency"
                        ]
                      },
                      title: {
                        type: "string"
                      },
                      "@ondc/org/item_id": {
                        type: "string"
                      },
                      "@ondc/org/title_type": {
                        type: "string"
                      },
                      "@ondc/org/item_quantity": {
                        type: "object",
                        properties: {
                          count: {
                            type: "integer"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            payment: {
              type: "object",
              properties: {
                type: {
                  type: "string"
                },
                status: {
                  type: "string"
                },
                "@ondc/org/settlement_basis": {
                  type: "string"
                },
                "@ondc/org/settlement_window": {
                  type: "string"
                },
                "@ondc/org/withholding_amount": {
                  type: "string"
                },
                "@ondc/org/buyer_app_finder_fee_type": {
                  type: "string"
                },
                "@ondc/org/buyer_app_finder_fee_amount": {
                  type: "string"
                },
                "@ondc/org/settlement_details": {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      bank_name: {
                        type: "string"
                      },
                      beneficiary_name: {
                        type: "string"
                      },
                      branch_name: {
                        type: "string"
                      },
                      settlement_bank_account_no: {
                        type: "string"
                      },
                      settlement_counterparty: {
                        type: "string"
                      },
                      settlement_ifsc_code: {
                        type: "string"
                      },
                      settlement_phase: {
                        type: "string"
                      },
                      settlement_type: {
                        type: "string"
                      }
                    },
                    required: [
                      "bank_name",
                      "beneficiary_name",
                      "branch_name",
                      "settlement_bank_account_no",
                      "settlement_counterparty",
                      "settlement_ifsc_code",
                      "settlement_phase",
                      "settlement_type"
                    ]
                  }
                },
                collected_by: {
                  type: "string"
                },
                params: {
                  type: "object",
                  properties: {
                    amount: {
                      type: "string"
                    },
                    currency: {
                      type: "string"
                    }
                  },
                  required: [
                    "amount",
                    "currency"
                  ]
                }
              },
              required: [
                "type",
                "status",
                "@ondc/org/settlement_basis",
                "@ondc/org/settlement_window",
                "@ondc/org/withholding_amount",
                "@ondc/org/buyer_app_finder_fee_type",
                "@ondc/org/buyer_app_finder_fee_amount",
                "@ondc/org/settlement_details",
                "collected_by",
                "params"
              ]
            }
            ,
            created_at: {
              type: "string",
              format: "date-time",
            },

            updated_at: {
              type: "string",
              format: "date-time",
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
            "created_at",
            "updated_at",
          ],
        },
      },
      required: ["order"],
    },
  },
  isFutureDated: true,
  required: ["context", "message"],
};