import { NextFunction, Request, Response } from "express";
import {
  LOGISTICS_BAP_MOCKSERVER_URL,
  MOCKSERVER_ID,
  send_response,
  send_nack,
  redis
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";

export const initiateStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId } = req.body;

    const transactionKeys = await redis.keys(`${transactionId}-*`);
    const ifTransactionExist = transactionKeys.filter((e) =>
      e.includes("on_confirm-from-server") || e.includes("on_confirm-to-server")
    );

    if (ifTransactionExist.length === 0) {
      return send_nack(res, "On Confirm doesn't exist");
    }

    const transaction = await redis.mget(ifTransactionExist);
    const parsedTransaction = transaction.map((ele) => {
      return JSON.parse(ele as string);
    });
    return intializeRequest(
      res,
      next,
      parsedTransaction[0].request,
    );
  } catch (error) {
    return next(error);
  }
};

const intializeRequest = async (
  res: Response,
  next: NextFunction,
  transaction: any,
) => {
  try {
    const {
      context,
      message: {
        order: { provider, provider_location, ...order },
      },
    } = transaction;
    const { transaction_id } = context;

    const status = {
      context: {
        ...context,
        message_id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: "status",
        bap_id: MOCKSERVER_ID,
        bap_uri: LOGISTICS_BAP_MOCKSERVER_URL,
      },
      message: {
        order_id: order.id,
      },
    };
    await send_response(res, next, status, transaction_id, "status");
    
  } catch (error) {
    next(error);
  }
};
