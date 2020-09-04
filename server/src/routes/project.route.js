import express from "express";
import { check, body, oneOf, query } from "express-validator";
import projectCtrl from "../controllers/project.controller";
import multer from "multer";
import path from "path";
import fs from "fs";
import config from "../../config/config";
const router = express.Router();

var tmpPath = config.uploadPath + "server/";
const filePath = path.resolve(tmpPath + "uploads/projects");
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		console.log("uploads dir");
		console.log(config.uploadPath + "server/uploads/projects");

		console.log("filePath");

		console.log(filePath, fs.existsSync(filePath));
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
			body("projectData.*.title")
				.exists()
				.withMessage("title is required"),
			body("projectData.*.description")
				.exists()
				.withMessage("description is required!")
		],
		upload.fields([
			{
				name: "images"
			}
		]),
		projectCtrl.create
	)
	.delete(
		"/deleteProject",
		[
			query("projectId")
				.exists()
				.withMessage("projectId is required")
		],
		projectCtrl.deleteProject
	)
	.get("/list", projectCtrl.getProjects)

	.get("/listProjects", projectCtrl.listProjects);

export default router;
