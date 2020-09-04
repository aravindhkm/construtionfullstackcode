import multer from "multer";
import path from "path";
import fs from "fs";
import { check, oneOf, body, query, param } from "express-validator";
import userCtrl from "../controllers/user.controller";
import config from "../../config/config";
import express from "express";
const router = express.Router();

var tmpPath = config.uploadPath + "server/";
const filePath = path.resolve(tmpPath + "uploads/users");
const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		console.log("uploads dir");
		console.log(config.uploadPath + "server/src/uploads/users");

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
			body("userData.*.firstName")
				.exists()
				.withMessage("firstName is required"),
			body("userData.*.email")
				.exists()
				.withMessage("Email is required"),
			body("userData.*.userName")
				.exists()
				.withMessage("userName is required"),
			body("userData.*.password")
				.exists()
				.withMessage("Password is required"),
			body("userData.*.role")
				.exists()
				.withMessage("role is required")
		],
		upload.fields([
			{
				name: "images"
			}
		]),
		userCtrl.create
	)
	.get("/list", userCtrl.getUsers)

	.get("/listUsers", userCtrl.listUsers)

	.post(
		"/updateStatus",
		[
			check("userId")
				.exists()
				.withMessage("userId is required")
		],
		userCtrl.updateStatus
	)

	.delete(
		"/deleteUser",
		[
			query("userId")
				.exists()
				.withMessage("userId is required")
		],
		userCtrl.deleteUser
	);

export default router;
