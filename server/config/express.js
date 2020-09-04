import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compress from "compression";
import methodOverride from "method-override";
import cors from "cors";
import httpStatus from "http-status";
import expressWinston from "express-winston";
import expressValidation from "express-validation";
import helmet from "helmet";
import path from "path";

import config from "./config";
import logger from "./winston/get-default-logger";
import routes from "../src/routes/index.route";
import APIError from "../src/helpers/APIError";
import { absolutePath } from "../src/swagger/index";
// import userCtrl from "../src/controllers/user.controller";

const pathToSwaggerUi = absolutePath();

console.log("DDdDdDDddDD 2", pathToSwaggerUi);

// Define default HTTP logger instance (use default logger instance)
const winstonInstance = logger;

const app = express();

// parse body params and attache them to req.body
app.use(express.json());
app.use(
	express.urlencoded({
		limit: "50mb",
		extended: true
	})
);
app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		extended: true
	})
);
app.use(bodyParser.json({}));

const staticResource = config.uploadPath + "server/uploads";
app.use(express.static(path.join(staticResource, "/")));
app.use(express.static(pathToSwaggerUi));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());
app.use(helmet());
app.use(cors());

// This is really just a test output and should be the first thing you see
winstonInstance.info("The application is starting...");
// enable detailed API logging in dev env
if (config.env === "development") {
	expressWinston.requestWhitelist.push("body");
	expressWinston.responseWhitelist.push("body");
	app.use(
		expressWinston.logger({
			winstonInstance,
			meta: true, // optional: log meta data about request (defaults to true)
			message:
				"HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
			colorStatus: "green" // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
		})
	);
}
console.log("DDdDdDDddDD");
console.log(__dirname);

const baseUrl = `/v${config.apiVersion}`;
console.log("baseUrl", baseUrl);
app.use(`${baseUrl}`, routes);

app.use((err, req, res, next) => {
	if (err instanceof expressValidation.ValidationError) {
		// validation error contains errors which is an array of error each containing message[]
		const unifiedErrorMessage = err.errors
			.map(error => error.messages.join(". "))
			.join(" and ");
		const error = new APIError(unifiedErrorMessage, err.status, true);

		return next(error);
	}
	if (!(err instanceof APIError)) {
		const apiError = new APIError(err.message, err.status, err.isPublic);

		return next(apiError);
	}
	return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new APIError("API not found", httpStatus.NOT_FOUND);

	return next(err);
});

// log error in winston transports except when executing test suite
if (config.env !== "test") {
	app.use(
		expressWinston.errorLogger({
			winstonInstance
		})
	);
}

// error handler, send stacktrace only during development
app.use((err, req, res, next) =>
	res.status(err.status).json({
		// eslint-disable-line no-unused-vars
		message: err.isPublic ? err.message : httpStatus[err.status],
		stack: config.env === "development" ? err.stack : {}
	})
);

export default app;
