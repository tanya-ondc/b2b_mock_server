import { NextFunction, Request, Response } from "express";
import {
  send_response,
  redis,
  send_nack,
  createAuthHeader,
  logger,
  redisFetchFromServer,
} from "../../../lib/utils";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";

export const initiateCancelController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId, orderId, cancellationReasonId } = req.body;
    const on_confirm = await redisFetchFromServer("on_confirm", transactionId);
    if (!on_confirm) {
      return send_nack(res, "On Confirm doesn't exist");
    }
    let context = on_confirm.context;
    const cancel = {
      context: {
        ...context,
        message_id: uuidv4(),
        timestamp: new Date().toISOString(),
        action: "cancel",
      },
      message: {
        order_id: orderId,
        cancellation_reason_id: cancellationReasonId,
      },
    };
    await send_response(res, next, cancel, transactionId, "cancel");
  } catch (error) {
    return next(error);
  }
}