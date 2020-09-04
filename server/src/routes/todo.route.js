import express from "express";
import { check, query } from "express-validator";
import todoCtrl from "../controllers/todo.controller";
const router = express.Router();

router
	.post(
		"/create",
		[
			check("title")
				.exists()
				.withMessage("title is required"),
			check("date")
				.exists()
				.withMessage("date is required"),
			check("time")
				.exists()
				.withMessage("time is required"),
			check("projectId")
				.exists()
				.withMessage("projectId is required"),
			check("userId")
				.exists()
				.withMessage("userId is required")
		],
		todoCtrl.create
	)
	.delete(
		"/deleteToDo",
		[
			query("todoId")
				.exists()
				.withMessage("todoId is required")
		],
		todoCtrl.deleteToDo
	)
	.post(
		"/updateStatus",
		[
			check("todoId")
				.exists()
				.withMessage("todoId is required")
		],
		todoCtrl.updateStatus
	)
	.get("/list", todoCtrl.list);

export default router;
