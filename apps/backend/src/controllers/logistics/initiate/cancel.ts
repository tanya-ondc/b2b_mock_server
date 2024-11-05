import { NextFunction, Request, Response } from "express";
import {
  send_response,
  send_nack,
  redisFetchFromServer,
  redisFetchToServer,
} from "../../../lib/utils";
import { v4 as uuidv4 } from "uuid";

export const initiateCancelController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId, cancellationReasonId } = req.body;
    const on_confirm = await redisFetchToServer("on_confirm", transactionId);
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
        order_id: on_confirm.message.order.id,
        cancellation_reason_id: cancellationReasonId.split(',')[1]?.trim(),
      },
    };
    await send_response(res, next, cancel, transactionId, "cancel");
  } catch (error) {
    return next(error);
  }
}