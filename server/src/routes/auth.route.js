import express from "express";
import { check, oneOf } from "express-validator";

import authCtrl from "../controllers/auth.controller";

const router = express.Router();
const errorMessage = "Either any one of 'userName or email is required";
router

	.post(
		"/login",
		[
			check("password")
				.exists()
				.withMessage("password is required"),
			check("type")
				.exists()
				.withMessage("type is required"),
			oneOf([
				check("userName")
					.exists()
					.withMessage(errorMessage),
				check("email")
					.exists()
					.withMessage(errorMessage)
			])
		],
		authCtrl.login
	)

	.post(
		"/forgotPassword",
		[
			check("email")
				.exists()
				.withMessage("Email is required")
		],
		authCtrl.forgotPassword
	)
	.post(
		"/resetPassword",
		[
			check("email")
				.exists()
				.withMessage("Email is required"),
			check("otp")
				.exists()
				.withMessage("OTP is required"),
			check("password")
				.exists()
				.withMessage("OTP is required")
		],
		authCtrl.resetPassword
	)
	.post(
		"/verifyOtp",
		[
			check("email")
				.exists()
				.withMessage("Email is required"),
			check("otp")
				.exists()
				.withMessage("OTP is required")
		],
		authCtrl.verifyOtp
	);

export default router;
