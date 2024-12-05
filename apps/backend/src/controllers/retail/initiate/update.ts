import { NextFunction, Request, Response } from "express";
import {
  B2C_BAP_MOCKSERVER_URL,
  send_response,
  MOCKSERVER_ID,
  redis,
  send_nack,
  createAuthHeader,
  redisFetchToServer,
  RETAIL_BAP_MOCKSERVER_URL,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";

export const initiateUpdateController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { update_targets, transactionId } = req.body;

    // const transactionKeys = await redis.keys(`${transactionId}-*`);
    // const ifTransactionExist = transactionKeys.filter((e) =>
    // 	e.includes("on_confirm-to-server")
    // );

    // if (ifTransactionExist.length === 0) {
    // 	send_nack(res,"On Confirm doesn't exist")
    // }

    // const transaction = await redis.mget(ifTransactionExist);
    // const parsedTransaction = transaction.map((ele) => {
    // 	return JSON.parse(ele as string);
    // });

    const onConfirm = await redisFetchToServer("on_confirm", transactionId);
    if (!onConfirm) {
      return send_nack(res, "On Confirm doesn't exist");
    }

    // const onConfirm = parsedTransaction[0].request;
   console.log("paymentsssssss",JSON.stringify(onConfirm.message.order.payments))
    if (
      // onConfirm.context.ttl !== "1D" ||
      !onConfirm.message.order.payments.every(
        (p: { type: string }) => p.type === "PRE-FULFILLMENT"
      )
    )
      return send_nack(res, "Update targets are allowed for RFQ flows only");
    // return res.status(400).json({
    // 	message: {
    // 		ack: {
    // 			status: "NACK",
    // 		},
    // 	},
    // 	error: {
    // 		message: "Update targets are allowed for RFQ flows only",
    // 	},
    // });

    return intializeRequest(res, next, update_targets, onConfirm);
  } catch (error) {
    return next(error);
  }
};

async function intializeRequest(
  res: Response,
  next: NextFunction,
  update_target: "payments",
  transaction: any
) {
  try {
    const { context, message } = transaction;
    const { transaction_id } = context;
    const timestamp = new Date().toISOString();

    let {
      order: { items, payments },
    } = message;

    items = items.map(({ id, quantity }: { id: string; quantity: object }) => ({
      id,
      quantity,
    }));
    payments = payments.map(
      ({
        tags,
        params,
        
        ...remainingPayments
      }: {
        uri:string,
        tags: object;
        params: object;
      }) => ({
        ...remainingPayments,
        params: { ...params, transaction_id: uuidv4() },
        tl_method: "http/get",
        status: "PAID",
        uri: "https://ondc.transaction.com/payment"
      })
    );

    const update = {
      context: {
        ...context,
        timestamp,
        action: "update",
        bap_id: MOCKSERVER_ID,
        bap_uri: RETAIL_BAP_MOCKSERVER_URL,
        message_id: uuidv4(),
      },
      message: {
        update_target:"payments",
        order: {
          id: message.order.id,
          state: message.order.state,
          provider: {
            id: message.order.provider.id,
          },
          items,
          payments,
        },
      },
    };

    console.log("updateeeresponse init",JSON.stringify(update))

    await send_response(res, next, update, transaction_id, "update");
    // const header = await createAuthHeader(update);

    // try {
    // 	await redis.set(
    // 		`${transaction_id}-update-from-server`,
    // 		JSON.stringify({ request: { ...update } })
    // 	);
    // 	const response = await axios.post(`${context.bpp_uri}/update`, update, {
    // 		headers: {
    // 			authorization: header,
    // 		},
    // 	});
    // 	await redis.set(
    // 		`${transaction_id}-update-from-server`,
    // 		JSON.stringify({
    // 			request: { ...update },
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
    next(error);
  }
}
