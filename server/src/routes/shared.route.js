import express from "express";
import { body, check, query, oneOf } from "express-validator";
import sharedCtrl from "../controllers/shared.controller";
import multer from "multer";
import path from "path";
import fs from "fs";
import config from "../../config/config";
const router = express.Router();

const filePath = path.resolve(config.uploadPath + "server/uploads");
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		if (!fs.existsSync(filePath)) {
			fs.mkdirSync(filePath, { recursive: true });
		}
		callback(null, filePath);
	},
	filename(req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage });

router
	.post(
		"/create",
		[
			body("inspectionData.*.name")
				.exists()
				.withMessage("name is required")
		],
		upload.fields([
			{
				name: "inspections"
			}
		]),
		sharedCtrl.create
	)
	.post(
		"/createPoint",
		[
			body("inspectionData.*.projectId")
				.exists()
				.withMessage("projectId is required"),
			body("inspectionData.*.inspectionId")
				.exists()
				.withMessage("inspectionId is required"),
			body("inspectionData.*.pointName")
				.exists()
				.withMessage("pointName is required")
		],
		sharedCtrl.createPoint
	)

	.post(
		"/createPointDetails",
		[
			oneOf([
				body("inspectionData.*.pointMapId")
					.exists()
					.withMessage("pointMapId is required"),
				body("inspectionData.*.inspectionId")
					.exists()
					.withMessage("inspectionId is required"),
				body("inspectionData.*.inspectionPointId")
					.exists()
					.withMessage("inspectionPointId is required")
			])
		],
		upload.fields([
			{
				name: "pointImages"
			}
		]),
		sharedCtrl.createPointDetails
	)
	.get("/list", sharedCtrl.getInspections)

	.delete(
		"/deleteInspections",
		[
			oneOf([
				query("inspectionId")
					.exists()
					.withMessage("Please provide inspectionId"),
				query("projectId")
					.exists()
					.withMessage("Please provide projectId")
			])
		],
		sharedCtrl.deleteInspections
	)
	.get("/getNotifications", sharedCtrl.getNotifications)

	.post(
		"/verifyInspection",
		[
			body("pointMapId")
				.exists()
				.withMessage("pointMapId is required")
		],
		sharedCtrl.verifyInspection
	)

	.delete(
		"/deleteNotifications",
		[
			query("notificationId")
				.exists()
				.withMessage("notificationId is required")
		],
		sharedCtrl.deleteNotifications
	)

	.post(
		"/createIssues",
		[
			body("issueData.*.projectId")
				.exists()
				.withMessage("projectId is required")
		],
		upload.fields([
			{
				name: "pointImages"
			}
		]),
		sharedCtrl.createIssues
	)

	.get("/getIssues", sharedCtrl.getIssues)

	.delete(
		"/deleteIssues",
		[
			oneOf([
				query("issueId")
					.exists()
					.withMessage("Please provide issueId"),
				query("projectId")
					.exists()
					.withMessage("Please provide projectId")
			])
		],
		sharedCtrl.deleteIssues
	)

	.get(
		"/exportPdf",
		[
			query("projectId")
				.exists()
				.withMessage("projectId is required")
		],
		sharedCtrl.exportPdf
	)

	.get("/reports", sharedCtrl.dashboardReports)

	.get("/getSettings", sharedCtrl.getSettings)

	.post("/updateSettings", sharedCtrl.updateSettings);

export default router;
