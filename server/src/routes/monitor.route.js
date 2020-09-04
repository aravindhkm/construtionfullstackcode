import express from "express";
import { body, checkBody, query, oneOf } from "express-validator";
import monitorCtrl from "../controllers/monitor.controller";
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
			body("monitorData.*.title")
				.exists()
				.withMessage("title is required")
		],
		upload.fields([
			{
				name: "monitors"
			}
		]),
		monitorCtrl.create
	)
	.post(
		"/createDrop",
		[
			body("monitorData.*.monitorId")
				.exists()
				.withMessage("monitorId is required"),
			body("monitorData.*.projectId")
				.exists()
				.withMessage("projectId is required"),
			body("monitorData.*.name")
				.exists()
				.withMessage("name is required")
		],
		monitorCtrl.createDrop
	)

	.post(
		"/createDropValue",
		[
			body("monitorData.*.projectId")
				.exists()
				.withMessage("projectId is required"),
			body("monitorData.*.monitorId")
				.exists()
				.withMessage("monitorId is required"),
			body("monitorData.*.monitorValueId")
				.exists()
				.withMessage("monitorValueId is required")
		],
		monitorCtrl.createDropValue
	)
	.post(
		"/createDropValueImages",
		[
			body("monitorData.*.monitorValueId")
				.exists()
				.withMessage("monitorValueId is required"),
			body("monitorData.*.monitorValueMapId")
				.exists()
				.withMessage("monitorValueMapId is required")
		],
		upload.fields([
			{
				name: "monitorValues"
			}
		]),
		monitorCtrl.createDropValueImages
	)
	.get("/list", monitorCtrl.getWorkMonitors)

	.get(
		"/exportPdf",
		[
			query("projectId")
				.exists()
				.withMessage("projectId is required"),
			query("type")
				.exists()
				.withMessage("type is required")
		],
		monitorCtrl.exportPdf
	)

	.delete(
		"/deleteWork",
		[
			oneOf([
				query("monitorId")
					.exists()
					.withMessage("Please provide monitorId"),
				query("projectId")
					.exists()
					.withMessage("Please provide projectId")
			])
		],
		monitorCtrl.deleteWorkMonitor
	);

export default router;
