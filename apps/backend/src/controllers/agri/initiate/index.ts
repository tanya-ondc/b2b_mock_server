import { Router } from "express";
import { initiateSearchController } from "./search";
import { initiateSelectController } from "./select";
import { initiateInitController } from "./init";
import { initiateConfirmController } from "./confirm";
import { initiateCancelController } from "./cancel";
import { initiateStatusController } from "./status";
import { initiateUpdateController } from "./update";
import { initiateRatingController } from "./rating";

export const initiateRouter = Router();
initiateRouter.post("/search", initiateSearchController)
initiateRouter.post("/select", initiateSelectController)
initiateRouter.post("/init", initiateInitController)
initiateRouter.post("/confirm", initiateConfirmController)
initiateRouter.post("/cancel", initiateCancelController)
initiateRouter.post("/status", initiateStatusController)
initiateRouter.post("/update", initiateUpdateController)
initiateRouter.post("/rating", initiateRatingController)