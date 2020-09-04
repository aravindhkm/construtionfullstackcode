import express from "express";
import { body, check, query, oneOf } from "express-validator";
import documentCtrl from "../controllers/document.controller";
import multer from "multer";
import path from "path";
import fs from "fs";
import config from "../../config/config";
const router = express.Router();

const filePath = path.resolve(config.uploadPath + "server/uploads");
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		// var filePath = path.resolve(tmpPath + "uploads");
		// if (file.fieldname === "docImages") {
		// 	filePath = filePath + "/project-documents/images";
		// }
		if (!fs.existsSync(filePath)) {
			fs.mkdirSync(filePath, { recursive: true });
		}
		callback(null, filePath);
	},
	filename(req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({ storage, limits: { fieldSize: 50 * 1024 * 1024 } });

router
	.post(
		"/create",
		[
			body("documentsData.*.projectId")
				.exists()
				.withMessage("projectId is required"),
			body("documentsData.*.actionId")
				.exists()
				.withMessage("actionId is required"),
			body("documentsData.*.type")
				.exists()
				.withMessage("type is required")
		],
		upload.fields([
			{
				name: "documents"
			},
			{
				name: "newDocuments"
			},
			{
				name: "docImages"
			}
		]),
		documentCtrl.create
	)

	.get("/list", documentCtrl.getDocuments)

	.get(
		"/download",
		[
			oneOf([
				query("documentId")
					.exists()
					.withMessage("documentId is required"),
				query("mapId")
					.exists()
					.withMessage("mapId is required")
			])
		],
		documentCtrl.downloadFile
	)

	.delete(
		"/deleteDocument",
		oneOf([
			query("documentId")
				.exists()
				.withMessage("documentId is required"),
			query("projectId")
				.exists()
				.withMessage("projectId is required"),
			query("mapId")
				.exists()
				.withMessage("mapId is required")
		]),
		documentCtrl.deleteDocument
	)

	.post(
		"/createDocument",
		[
			body("documentsData.*.projectId")
				.exists()
				.withMessage("projectId is required"),

			body("documentsData.*.type")
				.exists()
				.withMessage("type is required")
		],
		upload.fields([
			{
				name: "documents"
			}
		]),
		documentCtrl.createDocument
	)

	.post(
		"/uploadFile",
		upload.fields([
			{
				name: "documents"
			}
		]),
		documentCtrl.uploadFile
	);

export default router;
