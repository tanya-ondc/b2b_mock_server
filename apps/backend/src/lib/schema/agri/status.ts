import { DOMAIN, VERSION } from "./constants";

export const statusSchema = {
  $id: "statusSchema",
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
        city:{
          type:"string",
        },
        action: {
          type: "string",
          const: "status",
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
          const: "PT30S"
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
        order_id: {
          type: "string",
        },
      },
      required: ["order_id"],
    },
  },
  required: ["context", "message"],
};