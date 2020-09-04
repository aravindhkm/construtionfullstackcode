import express from "express";
import { body, check, query, oneOf } from "express-validator";
import surveyCtrl from "../controllers/survey.controller";
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
			body("surveyData.*.name")
				.exists()
				.withMessage("name is required")
		],
		upload.fields([
			{
				name: "images"
			}
		]),
		surveyCtrl.create
	)
	.post(
		"/createProperty",
		[
			body("surveyData.*.projectId")
				.exists()
				.withMessage("projectId is required"),
			body("surveyData.*.name")
				.exists()
				.withMessage("name is required")
		],
		surveyCtrl.createProperty
	)

	.post(
		"/conditionProperty",
		[
			body("surveyData.*.projectId")
				.exists()
				.withMessage("projectId is required"),
			body("surveyData.*.surveyId")
				.exists()
				.withMessage("surveyId is required"),
			body("surveyData.*.propertyId")
				.exists()
				.withMessage("propertyId is required")
		],
		upload.fields([
			{
				name: "propertyImages"
			}
		]),
		surveyCtrl.conditionProperty
	)

	.post(
		"/preConditionProperty",
		[
			body("surveyData.*.projectId")
				.exists()
				.withMessage("projectId is required"),
			body("surveyData.*.surveyId")
				.exists()
				.withMessage("surveyId is required"),
			body("surveyData.*.propertyId")
				.exists()
				.withMessage("propertyId is required")
		],
		upload.fields([
			{
				name: "propertyImages"
			}
		]),
		surveyCtrl.preConditionProperty
	)

	.get("/list", surveyCtrl.getSurveys)

	.get(
		"/exportPdf",
		[
			query("projectId")
				.exists()
				.withMessage("projectId is required"),
			query("surveyType")
				.exists()
				.withMessage("surveyType is required")
		],
		surveyCtrl.exportPdf
	)

	.delete(
		"/deleteSurvey",
		[
			oneOf([
				query("surveyId")
					.exists()
					.withMessage("Please provide surveyId"),
				query("projectId")
					.exists()
					.withMessage("Please provide projectId"),
				query("propertyId")
					.exists()
					.withMessage("Please provide propertyId")
			])
		],
		surveyCtrl.deleteSurvey
	);

export default router;
