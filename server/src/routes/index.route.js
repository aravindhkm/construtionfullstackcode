import express from "express";
import moment from "moment";
import _ from "lodash";
import authService from "../services/auth.service";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import projectRoutes from "./project.route";
import masterRoutes from "./master.route";
import documentRoutes from "./document.route";
import monitorRoutes from "./monitor.route";
import todoRoutes from "./todo.route";
import sharedRoutes from "./shared.route";
import surveyRoutes from "./survey.route";
const router = express.Router(); // eslint-disable-line new-cap

/**
 * @param token
 */
function _validateToken(token) {
	console.log("_validateToken", token);

	return new Promise(async (resolve, reject) => {
		const decoded = await authService.decode(token);
		const currentTime = moment().unix();
		if (decoded && currentTime < decoded.exp) {
			resolve({
				status: "true",
				msg: "Successful Authorization!",
				decoded
			});
		} else {
			console.log("TOKEN EXPIREDDDDD");
			reject({ status: false, msg: "Invalid Token" });
		}
	});
}

/** GET /health-check - Check service health */
router.get("/health-check", (req, res) => res.send("OK!!!"));

router.use((req, res, next) => {
	console.log("req.url");
	console.log(req.url);
	const allowedUrls = [
		"/auth/login",
		"/auth/forgotPassword",
		"/auth/verifyOtp",
		"/auth/resetPassword",
		"/documents/download",
		"/monitors/exportPdf",
		"/shared/exportPdf",
		"/survey/exportPdf"
	];

	if (
		req.method !== "OPTIONS" &&
		!_.includes(allowedUrls, req.url.split("?")[0])
	) {
		const token =
			req.headers["Authorization"] || req.headers["authorization"];
		_validateToken(token).then(
			res => {
				console.log("_validateToken", res);
				next();
			},
			err => {
				res.status(403).send({
					status: "false",
					msg: "Failed to authenticate user - USER",
					err
				});
			}
		);
	} else {
		next();
	}
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/masters", masterRoutes);
router.use("/documents", documentRoutes);
router.use("/monitors", monitorRoutes);
router.use("/todos", todoRoutes);
router.use("/shared", sharedRoutes);
router.use("/survey", surveyRoutes);
export default router;
