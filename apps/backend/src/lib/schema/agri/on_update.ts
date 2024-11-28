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
            id: { type: "string" },
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
                    required: ["price", "title"]
                  }
                }
              },
              required: ["ttl", "price", "breakup"]
            },
            state: { type: "string" }
          },
          required: ["id", "items", "quote", "state"]
        }
      },
      required: ["order"]
    },
  },
  required: ["context", "message"],
};
