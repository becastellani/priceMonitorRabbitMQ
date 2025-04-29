import express from "express";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./config/swagger.json" with { type: "json" };
import proMid from "express-prometheus-middleware";

import database from "./config/database.js";
import routes from "./routes.js";

import hateos from "./middlewares/hateos.js";
import handler from "./middlewares/handler.js";

dotenv.config();
database.config(process.env.DATABASE);

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(proMid({
    metricsPath : "/metrics",
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    requestLengthBuckets: [515, 1024, 5120, 10240],
    responseLengthBuckets: [515, 1024, 5120, 10240],
}))
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(hateos);
app.use(handler);
app.use(routes);

export default app;