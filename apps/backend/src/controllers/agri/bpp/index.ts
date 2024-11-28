import { Router } from "express";
import { searchController } from "./search";
import { initController } from "./init";
import { selectController } from "./select";
import { confirmController } from "./confirm";
import { statusController } from "./status";
import { updateController } from "./update";
import { cancelController } from "./cancel";
import { jsonSchemaValidator, redisRetriever } from "../../../middlewares";
import { ratingController } from "./rating";

export const bppRouter = Router();

bppRouter.post(
	"/search",
	jsonSchemaValidator({ domain: "agri", action: "search" }),
	redisRetriever,
	searchController
);

bppRouter.post(
	"/init",
	jsonSchemaValidator({ domain: "agri", action: "init" }),
	redisRetriever,
	initController
);

bppRouter.post(
	"/select",
	jsonSchemaValidator({ domain: "agri", action: "select" }),
	redisRetriever,
	selectController
);

bppRouter.post(
	"/confirm",
	jsonSchemaValidator({ domain: "agri", action: "confirm" }),
	redisRetriever,
	confirmController
);

bppRouter.post(
	"/update",
	jsonSchemaValidator({ domain: "agri", action: "update" }),
	redisRetriever,
	updateController
);

bppRouter.post(
	"/status",
	jsonSchemaValidator({ domain: "agri", action: "status" }),
	redisRetriever,
	statusController
);

bppRouter.post(
	"/cancel",
	jsonSchemaValidator({ domain: "agri", action: "cancel" }),
	redisRetriever,
	cancelController
);

bppRouter.post(
	"/rating",
	jsonSchemaValidator({ domain: "agri", action: "rating" }),
	redisRetriever,
	ratingController
);
