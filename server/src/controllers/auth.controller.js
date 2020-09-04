import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import utils from "../services/utils.service";
import bcryptService from "../services/bcrypt.service";
import authService from "../services/auth.service";
import config from "../../config/config";
import label from "../../config/resources";
import db from "../../config/sequelize";
import nodemailer from "nodemailer";
const { Users, Settings } = db;

const UserController = () => {
	/* login */
	const login = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let whereCodn = {};
			if (reqObj.type == "web") {
				whereCodn["role"] = ["admin", "superadmin"];
			} else {
				whereCodn["role"] = ["staff", "contractor"];
			}
			if (reqObj.email) {
				whereCodn["email"] = reqObj.email;
			}
			if (reqObj.userName) {
				whereCodn["userName"] = reqObj.userName;
			}
			whereCodn["isDeleted"] = 0;
			whereCodn["status"] = true;

			if (reqObj.type == "mobile") {
				let settingData = await Settings.findOne({
					where: { name: "appMaintenance", status: true }
				});
				if (_.size(settingData) > 0) {
					return res.status(httpStatus.FORBIDDEN).json({
						status: false,
						message: label.MAINTENANCE
					});
				}
			}

			let userData = await Users.findOne({
				where: whereCodn
			});
			if (userData) {
				let auth = await bcryptService().comparePassword(
					reqObj.password,
					userData.password
				);
				if (auth) {
					let token = await authService.issue(userData.userName);
					let deviceToken = reqObj.deviceToken
						? reqObj.deviceToken
						: null;
					await Users.update(
						{
							deviceToken: deviceToken,
							token: token,
							deviceType: reqObj.type
						},
						{
							where: whereCodn
						}
					);
					return res.status(httpStatus.OK).json({
						status: true,
						message: label.LOGIN_SUCCESS,
						token: token,
						data: userData
					});
				} else {
					return res.status(httpStatus.BAD_REQUEST).json({
						status: false,
						message: label.WRONG_PSW
					});
				}
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: false,
					message: label.LOGIN_FAILED
				});
			}
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* forgot password */
	const forgotPassword = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const userInput = utils.getReqValues(req);
			let otp = utils.generateOTP();

			let whereCodn = {};

			whereCodn = {
				email: userInput.email,
				status: true,
				isDeleted: 0
			};
			await Users.findOne({
				where: whereCodn
			})
				.then(async function(response) {
					if (response) {
						let smtpTransport = nodemailer.createTransport({
							service: config.smtpService,
							host: config.smtpHost,
							auth: {
								user: config.commonEmail, // generated ethereal user
								pass: config.commonEmailPwd // generated ethereal password
							}
						});
						smtpTransport.verify(function(error, success) {
							if (error) {
								console.log(error);
							} else {
								console.log(
									"Server is ready to take our messages"
								);
							}
						});

						var mailOptions = {
							to: userInput.email,
							from: "******",
							subject: "Construction APP - Forgot Password:",
							cc: "*******",
							text:
								"Hello " +
								response.userName +
								"," +
								"\n\n" +
								"Please Use this OTP to Reset :" +
								otp
						};
						smtpTransport.sendMail(mailOptions, async function(
							err
						) {
							console.log("errerr", err);
							if (err) {
								console.log("errrrr");
								return res.status(httpStatus.BAD_REQUEST).json({
									status: false,
									message: label.EMAIL_SENT_FAILED
								});
							} else {
								console.log("success");
								await Users.update(
									{ otp: otp },
									{
										where: {
											email: userInput.email
										}
									}
								);
								return res.status(httpStatus.OK).json({
									status: true,
									message: label.OTP_SUCCESS
								});
							}
						});
					} else {
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.EMAIL_INVALID
						});
					}
				})
				.catch(function(err) {
					console.log(err);
				});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* reset password */
	const resetPassword = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const userInput = utils.getReqValues(req);
			const { password, email, otp } = userInput;

			let whereCodn = {};
			whereCodn["email"] = email;
			whereCodn["otp"] = otp;
			await Users.findOne({
				where: whereCodn
			})
				.then(async function(response) {
					if (response) {
						await Users.update(
							{ password: password, otp: null },
							{
								where: whereCodn
							}
						);
						return res.status(httpStatus.OK).json({
							status: true,
							message: label.PASS_RESET_SUCCESS
						});
					} else {
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.EMAIL_OTP_INVALID
						});
					}
				})
				.catch(function(err) {
					return res.status(httpStatus.BAD_REQUEST).json({
						status: false,
						message: label.PASS_RESET_FAILED
					});
				});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* verify otp */
	const verifyOtp = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const userInput = utils.getReqValues(req);
			const { email, otp } = userInput;

			let whereCodn = {};
			whereCodn["email"] = email;
			whereCodn["otp"] = otp;
			await Users.findOne({
				where: whereCodn
			})
				.then(async function(response) {
					if (response) {
						return res.status(httpStatus.OK).json({
							status: true,
							message: label.OTP_VRIFY_SUCCESS
						});
					} else {
						return res.status(httpStatus.BAD_REQUEST).json({
							status: false,
							message: label.OTP_VRIFY_FAILED
						});
					}
				})
				.catch(function(err) {
					console.log(err);
				});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	return {
		login,
		forgotPassword,
		resetPassword,
		verifyOtp
	};
};

export default UserController();
