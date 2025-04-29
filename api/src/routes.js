import { Router } from "express";

import NotFound from "./routers/helpers/404.js";
import InternalServerError from "./routers/helpers/500.js";

import hateos from "./middlewares/hateos.js";
import handler from "./middlewares/handler.js";

import ProductRouter from "./routers/productRouter.js";

// import { verify } from "./controllers/authController.js"


const routes = Router()
routes.use(hateos);
routes.use(handler);

routes.use("/api/product", ProductRouter)

routes.use(InternalServerError)
routes.use(NotFound);

export default routes;