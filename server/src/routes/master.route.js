import express from "express";
import { check, query } from "express-validator";
import masterCtrl from "../controllers/master.controller";
const router = express.Router();

router.get(
	"/list",
	[
		query("type")
			.exists()
			.withMessage("type is required")
	],
	masterCtrl.getMasters
);

export default router;
