import _ from "lodash";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import fs from "fs";
import path from "path";
import moment from "moment";
import config from "../../config/config";
const saltRounds = 10;
import db from "../../config/sequelize";
import { promisify } from "util";
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const { Users, ProjectCategories, Actions, Settings } = db;
export default {
	dateDiff(date, diffStr) {
		const currDate = moment();
		const createdDate = moment(date);

		console.log("currDate", currDate.format());
		console.log("createdDate", createdDate.format(), diffStr);
		return currDate.diff(createdDate, diffStr);
	},

	generateOTP() {
		const min = 100000;
		const max = 999999;

		return Math.floor(Math.random() * (max - min + 1)) + min;
	},

	validateEmail(email) {
		const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return re.test(email);
	},

	getReqValues(req) {
		return _.pickBy(_.extend(req.body, req.params, req.query), _.identity);
	},

	password(user) {
		const salt = bcrypt.genSaltSync(saltRounds);
		const hash = bcrypt.hashSync(user.password, salt);
		return hash;
	},
	updatePassword(pass) {
		const salt = bcrypt.genSaltSync(saltRounds);
		const hash = bcrypt.hashSync(pass, salt);

		return hash;
	},
	comparePassword(pw, hash) {
		const pass = bcrypt.compareSync(pw, hash);

		return pass;
	},

	async generateFilePath(projectId, type, fileValues) {
		let basePath;
		let fileName =
			fileValues[0] && fileValues[0].originalname
				? fileValues[0].originalname
				: fileValues.filename;
		let filePath =
			fileValues[0] && fileValues[0].path
				? fileValues[0].path
				: fileValues.path;
		if (type == "issue-defects") {
			basePath = `project-documents/${projectId}/issues/defects/`;
		} else if (type == "issue-rectify") {
			basePath = `project-documents/${projectId}/issues/rectify/`;
		} else if (type == "inspection-defects") {
			basePath = `project-documents/${projectId}/inspections/defects/`;
		} else if (type == "inspection-rectify") {
			basePath = `project-documents/${projectId}/inspections/rectify/`;
		} else if (type == "work-monitor-drop-images") {
			basePath = `project-documents/${projectId}/work-monitors/drop-images/`;
		} else if (type == "condition") {
			basePath = `surveys/${projectId}/condition-survey/point-images/`;
		} else if (type == "pre-condition") {
			basePath = `surveys/${projectId}/pre-condition-survey/drop-images/`;
		} else {
			basePath = `project-documents/${projectId}/${type}/`;
		}

		let dir_name = config.uploadPath + "server/uploads" + "/";
		let upload_path = `${dir_name}${basePath}`;
		let documentName = `${upload_path}${fileName}`;
		if (!fs.existsSync(upload_path)) {
			fs.mkdirSync(upload_path, {
				recursive: true
			});
		}
		if (filePath && fs.existsSync(filePath)) {
			const buffer = await readFile(filePath);
			await writeFile(documentName, buffer);
			await this.unLinkFilePath(filePath);
		}
		return true;
	},

	unLinkFilePath(filePath) {
		return new Promise(resolve => {
			fs.unlink(filePath, err => {
				if (err) {
					resolve({ status: false, message: err });
				} else {
					resolve({ status: true });
				}
			});
		});
	},

	readHTMLFile(path, callback) {
		fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
			if (err) {
				console.log(err);
				callback(err);
			} else {
				console.log(html);
				callback(null, html);
			}
		});
	},

	generateToken(data) {
		const mobileResponse = {};
		const tokenObject = {};

		tokenObject.id = data._id;
		return new Promise((resolve, reject) => {
			jsonwebtoken.sign(
				tokenObject,
				config.jwtSecret,
				{ expiresIn: config.jwtTokenExpire },
				(err, token) => {
					if (err) {
						console.log(err);
						mobileResponse.error = true;
						mobileResponse.errorMessage = err;
						resolve(mobileResponse);
					} else if (res.success === true) {
						mobileResponse.error = false;
						resolve(mobileResponse);
					} else {
						mobileResponse.error = true;
						resolve(mobileResponse);
					}
				}
			);
		});
	},

	initialUserRecords() {
		fs.readFile(
			config.uploadPath + "server/config/initialRecords.json",
			(err, data) => {
				if (data) {
					const initialRecords = JSON.parse(data);
					Object.keys(initialRecords).forEach(async tableName => {
						if (tableName == "Users") {
							_.forEach(
								initialRecords[tableName],
								async records => {
									try {
										await this.createInitialRecord(
											tableName,
											records
										);
									} catch (err) {
										console.error(
											"Initial Record Error",
											err
										);
									}
								}
							);
						} else {
							await this.createInitialRecord(
								tableName,
								initialRecords[tableName]
							);
						}
					});
				}
			}
		);
	},

	async createInitialRecord(tableName, records) {
		try {
			if (tableName == "Users") {
				await Users.create(records);
			} else if (tableName == "ProjectCategories") {
				await ProjectCategories.bulkCreate(records);
			} else if (tableName == "Actions") {
				await Actions.bulkCreate(records);
			} else if (tableName == "Settings") {
				await Settings.bulkCreate(records);
			}
		} catch (err) {
			console.log("err" + err);
		}
	}
};
