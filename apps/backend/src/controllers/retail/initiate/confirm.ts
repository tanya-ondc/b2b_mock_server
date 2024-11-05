import { NextFunction, Request, Response } from "express";
import {
  MOCKSERVER_ID,
  send_response,
  send_nack,
  Stop,
  redisFetchToServer,
  B2C_BAP_MOCKSERVER_URL,
  RETAIL_BAP_MOCKSERVER_URL,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";

export const initiateConfirmController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {version} = req.query;
    const { scenario, transactionId } = req.body;

    // const transactionKeys = await redis.keys(`${transactionId}-*`);
    // const ifTransactionExist = transactionKeys.filter((e) =>
    // 	e.includes("on_init-to-server")
    // );

    // if (ifTransactionExist.length === 0) {
    // 	send_nack(res,"On Init doesn't exist")
    // }
    // const transaction = await redis.mget(ifTransactionExist);
    // const parsedTransaction = transaction.map((ele) => {
    // 	return JSON.parse(ele as string);
    // });
    const on_init = await redisFetchToServer("on_init", transactionId);
    if (!on_init) {
      return send_nack(res, "On Init doesn't exist");
    }
    // console.log("parsedTransaction:::: ", parsedTransaction[0]);
    return intializeRequest(res, next, on_init, scenario, version);
  } catch (error) {
    return next(error);
  }
};

const intializeRequest = async (
  res: Response,
  next: NextFunction,
  transaction: any,
  scenario: string,
  version:any
) => {
  try {
    const {
      context,
      message: {
        order: { provider, provider_location, tags, ...order },
      },
    } = transaction;
    const { transaction_id } = context;
    const timestamp = new Date().toISOString();

    let confirm;
    if(version==="b2b"){
      const confirmb2b = {
        context: {
          ...context,
          timestamp,
          action: "confirm",
          bap_id: MOCKSERVER_ID,
          bap_uri: RETAIL_BAP_MOCKSERVER_URL,
          message_id: uuidv4(),
        },
        message: {
          order: {
            // ...order,
            id: uuidv4(),
            state: "Created",
            provider: {
              id: provider.id,
              locations: [
                {
                  ...provider_location,
                },
              ],
            },
            fulfillments: order.fulfillments.map(
              ({
                id,
                type,
                tracking,
                stops,
              }: {
                id: string;
                type: string;
                tracking: boolean;
                stops: Stop;
              }) => ({
                id,
                type,
                tracking,
                stops,
              })
            ),
            payments: [
              {
                ...order.payments[0],
                params: {
                  currency: order.quote.price.currency,
                  amount: order.quote.price.value,
                  transaction_id: "3937",
                  bank_code: "xxxxxxxxx",
                  bank_account_number: "xxxxxxxxxxxx"
                },
                status: "NOT-PAID",
                "@ondc/org/settlement_details": [
                  {
                    settlement_counterparty: "buyer-app",
                    settlement_phase: "sale-amount",
                    settlement_type: "upi",
                    upi_address: "gft@oksbi",
                    settlement_bank_account_no: "XXXXXXXXXX",
                    settlement_ifsc_code: "XXXXXXXXX",
                    beneficiary_name: "xxxxx",
                    bank_name: "xxxx",
                    branch_name: "xxxx",
                  },
                ],
              },
            ],
            quote:order?.quote,
            items:[{
              id:order?.items[0].id,
              fulfillment_ids:order?.items[0].fulfillment_ids,
              quantity:order.items[0].quantity
            }],
            tags: [
              ...tags,
              {
                descriptor: {
                  code: "bap_terms",
                },
                list: [
                  {
                    descriptor: {
                      code: "accept_bpp_terms",
                    },
                    value: "Y",
                  },
                ],
              },
            ],
            billing:order?.billing,
            created_at: timestamp,
            updated_at: timestamp,
          },
        },
      };
      confirm=confirmb2b
    }
    else{
      const confirmb2c = {
        context: {
          ...context,
          timestamp,
          action: "confirm",
          bap_id: MOCKSERVER_ID,
          bap_uri: RETAIL_BAP_MOCKSERVER_URL,
          message_id: uuidv4(),
        },
        message: {
          order: {
            // ...order,
            id: uuidv4(),
            state: "Created",
            provider: {
              id: provider.id,
              locations: [
                {
                  ...provider_location,
                },
              ],
            },
            fulfillments: order.fulfillments.map(
              ({
                id,
                type,
                tracking,
                stops,
              }: {
                id: string;
                type: string;
                tracking: boolean;
                stops: Stop;
              }) => ({
                id,
                type,
                tracking,
                stops,
              })
            ),
            payments: [
              {
                ...order.payments[0],
                params: {
                  currency: order.quote.price.currency,
                  amount: order.quote.price.value,
                  transaction_id: "3937",
                  bank_code: "xxxxxxxxx",
                  bank_account_number: "xxxxxxxxxxxx"
                },
                status: "NOT-PAID",
                "@ondc/org/settlement_details": [
                  {
                    settlement_counterparty: "buyer-app",
                    settlement_phase: "sale-amount",
                    settlement_type: "upi",
                    upi_address: "gft@oksbi",
                    settlement_bank_account_no: "XXXXXXXXXX",
                    settlement_ifsc_code: "XXXXXXXXX",
                    beneficiary_name: "xxxxx",
                    bank_name: "xxxx",
                    branch_name: "xxxx",
                  },
                ],
              },
            ],
            quote:order?.quote,
            items:[{
              id:order?.items[0].id,
              fulfillment_ids:order?.items[0].fulfillment_ids,
              quantity:order.items[0].quantity
            }],
            tags: [
              ...tags,
              {
                descriptor: {
                  code: "bap_terms",
                },
                list: [
                  {
                    descriptor: {
                      code: "accept_bpp_terms",
                    },
                    value: "Y",
                  },
                ],
              },
            ],
            billing:order?.billing,
            created_at: timestamp,
            updated_at: timestamp,
          },
        },
      };
      confirm=confirmb2c
    }
   

    await send_response(
      res,
      next,
      confirm,
      transaction_id,
      "confirm",
      (scenario = scenario)
    );
    // const header = await createAuthHeader(confirm);
    // try {
    // 	await redis.set(
    // 		`${transaction_id}-confirm-from-server`,
    // 		JSON.stringify({ request: { ...confirm } })
    // 	);
    // 	const response = await axios.post(`${context.bpp_uri}/confirm?scenario=${scenario}`, confirm, {
    // 		headers: {
    // 			// "X-Gateway-Authorization": header,
    // 			authorization: header,
    // 		},
    // 	});
    // 	await redis.set(
    // 		`${transaction_id}-confirm-from-server`,
    // 		JSON.stringify({
    // 			request: { ...confirm },
    // 			response: {
    // 				response: response.data,
    // 				timestamp: new Date().toISOString(),
    // 			},
    // 		})
    // 	);

    // 	return res.json({
    // 		message: {
    // 			ack: {
    // 				status: "ACK",
    // 			},
    // 		},
    // 		transaction_id,
    // 	});
    // } catch (error) {
    // 	return next(error)
    // }
  } catch (error) {
    return next(error);
  }
};
