import { DOMAIN, VERSION } from "./constants";

export const onUpdateSchema = {
  $id: "onUpdateSchema",
  type: "object",
  properties: {
    context: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          enum: DOMAIN,
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
          const: "on_update",
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
            state: {
              type: "string",
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
              // required: ["id", "locations"],
              required: ["id"],
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
                      count: { type: "integer" }
                    },
                    required: ["count"]
                  },
                  fulfillment_id: { type: "string" }
                },
                required: ["id", "quantity", "fulfillment_id"]
              }
            },
            payment: {
              type: "object",
              properties: {
                time: {
                  type: "object",
                  properties: {
                    timestamp: { type: "string" }
                  },
                  required: ["timestamp"]
                },
                type: { type: "string" },
                params: {
                  type: "object",
                  properties: {
                    amount: { type: "string" },
                    currency: { type: "string" },
                    transaction_id: { type: "string" }
                  },
                  required: ["amount", "currency", "transaction_id"]
                },
                status: { type: "string" },
                collected_by: { type: "string" },
              },
              required: [
                "time",
                "type",
                "params",
                "status",
                "collected_by",
              ]
            },
            // fulfillments: {
            //   type: "array",
            //   items: {
            //     type: "object",
            //     properties: {
            //       id: { type: "string" },
            //       end: {
            //         type: "object",
            //         properties: {
            //           time: {
            //             type: "object",
            //             properties: {
            //               range: {
            //                 type: "object",
            //                 properties: {
            //                   start: { type: "string" },
            //                   end: { type: "string" }
            //                 },
            //                 required: ["start", "end"]
            //               },
            //               timestamp: { type: "string" }
            //             },
            //             required: ["range", "timestamp"]
            //           },
            //           person: {
            //             type: "object",
            //             properties: {
            //               name: { type: "string" }
            //             },
            //             required: ["name"]
            //           },
            //           contact: {
            //             type: "object",
            //             properties: {
            //               phone: { type: "string" }
            //             },
            //             required: ["phone"]
            //           },
            //           location: {
            //             type: "object",
            //             properties: {
            //               gps: { type: "string" },
            //               address: {
            //                 type: "object",
            //                 properties: {
            //                   city: { type: "string" },
            //                   name: { type: "string" },
            //                   state: { type: "string" },
            //                   country: { type: "string" },
            //                   building: { type: "string" },
            //                   locality: { type: "string" },
            //                   area_code: { type: "string" }
            //                 },
            //                 required: ["city", "name", "state", "country", "building", "locality", "area_code"]
            //               }
            //             },
            //             required: ["gps", "address"]
            //           }
            //         },
            //         required: ["time", "person", "contact", "location"]
            //       },
            //       type: { type: "string" },
            //       start: {
            //         type: "object",
            //         properties: {
            //           time: {
            //             type: "object",
            //             properties: {
            //               range: {
            //                 type: "object",
            //                 properties: {
            //                   start: { type: "string" },
            //                   end: { type: "string" }
            //                 },
            //                 required: ["start", "end"]
            //               },
            //               timestamp: { type: "string" }
            //             },
            //             required: ["range", "timestamp"]
            //           },
            //           contact: {
            //             type: "object",
            //             properties: {
            //               email: { type: "string" },
            //               phone: { type: "string" }
            //             },
            //             required: ["email", "phone"]
            //           },
            //           location: {
            //             type: "object",
            //             properties: {
            //               gps: { type: "string" },
            //               address: {
            //                 type: "object",
            //                 properties: {
            //                   city: { type: "string" },
            //                   name: { type: "string" },
            //                   state: { type: "string" },
            //                   country: { type: "string" },
            //                   building: { type: "string" },
            //                   locality: { type: "string" },
            //                   area_code: { type: "string" }
            //                 },
            //                 required: ["city", "name", "state", "country", "building", "locality", "area_code"]
            //               },
            //               descriptor: {
            //                 type: "object",
            //                 properties: {
            //                   name: { type: "string" }
            //                 },
            //                 required: ["name"]
            //               }
            //             },
            //             required: ["gps", "address", "descriptor"]
            //           }
            //         },
            //         required: ["time", "contact", "location"]
            //       },
            //       state: {
            //         type: "object",
            //         properties: {
            //           descriptor: {
            //             type: "object",
            //             properties: {
            //               code: { type: "string" }
            //             },
            //             required: ["code"]
            //           }
            //         },
            //         required: ["descriptor"]
            //       },
            //       "@ondc/org/TAT": { type: "string" },
            //       "@ondc/org/category": { type: "string" },
            //       "@ondc/org/provider_name": { type: "string" },
            //       tags: {
            //         type: "array",
            //         items: {
            //           type: "object",
            //           properties: {
            //             code: { type: "string" },
            //             list: {
            //               type: "array",
            //               items: {
            //                 type: "object",
            //                 properties: {
            //                   code: { type: "string" },
            //                   value: { type: "string" }
            //                 },
            //                 required: ["code", "value"]
            //               }
            //             }
            //           },
            //           required: ["code", "list"]
            //         }
            //       }
            //     },
            //     required: ["id", "end", "type", "start", "state"]
            //   }
            // },
            quote: {
              type: "object",
              properties: {
                ttl: { type: "string" },
                price: {
                  type: "object",
                  properties: {
                    value: { type: "string" },
                    currency: { type: "string" }
                  },
                  required: ["value", "currency"]
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
                              value: { type: "string" },
                              currency: { type: "string" }
                            },
                            required: ["value", "currency"]
                          }
                        }
                      },
                      price: {
                        type: "object",
                        properties: {
                          value: { type: "string" },
                          currency: { type: "string" }
                        },
                        required: ["value", "currency"]
                      },
                      title: { type: "string" },
                      "@ondc/org/item_id": { type: "string" },
                      "@ondc/org/title_type": { type: "string" },
                      "@ondc/org/item_quantity": {
                        type: "object",
                        properties: {
                          count: { type: "integer" }
                        },
                        required: ["count"]
                      }
                    },
                    required: ["title", "@ondc/org/item_id", "@ondc/org/title_type", "price"]
                  }
                }
              },
              required: ["ttl", "price", "breakup"]
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
                    area_code: { type: "string" }
                  },
                  required: ["city", "name", "state", "country", "building", "locality", "area_code"]
                },
                created_at: { type: "string" },
                updated_at: { type: "string" }
              },
              required: ["name", "phone", "address", "created_at", "updated_at"]
            }
          },
          required: [
            "id",
            "state",
            "provider",
            "items",
            "payment",
            "fulfillments",
            "quote",
          ],
        },
      },
      // required: ["order"],
    },
  },
  required: ["context", "message"],
};
