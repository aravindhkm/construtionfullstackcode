import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import async from "async";
import moment from "moment";
import db from "../../config/sequelize";
import utils from "../services/utils.service";
import label from "../../config/resources";
import config from "../../config/config";
import path from "path";
import Handlebars from "handlebars";
import pdf from "html-pdf";
import notification from "../services/notification.service";
const IMAGE_PATH = config.PROTOCAL + config.BASE_URL + ":" + config.port + "/";
const {
	Projects,
	ProjectInspections,
	ProjectInspectionPoints,
	ProjectInspectionPointMaps,
	Notifications,
	ProjectIssues,
	Settings,
	Users
} = db;
const Op = db.Sequelize.Op;

const SharedController = () => {
	/* create / update inspection-report */
	const create = async (req, res) => {
		try {
			const inspectionObj = utils.getReqValues(req);
			console.log(inspectionObj, "inspectionObj===============");
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = JSON.parse(inspectionObj.inspectionData);

			// let inspectionArray = [];
			if (reqObj && reqObj.length > 0) {
				let imageFiles = req.files.inspections
					? req.files.inspections
					: inspectionObj.inspections
					? JSON.parse(inspectionObj.inspections)
					: [];

				console.log(reqObj, "reqObj===============");
				let fileValues;
				reqObj.forEach(async value => {
					// await async.eachSeries(reqObj, async (value, callback) => {
					if (imageFiles && imageFiles.length > 0) {
						fileValues = _.filter(imageFiles, [
							"originalname",
							value.fileName
						]);
						await utils.generateFilePath(
							value.projectId,
							"inspections",
							fileValues
						);
					}
					let inspectionObj = {
						projectId: value.projectId,
						imageName: value.fileName ? value.fileName : null,
						name: value.name,
						path:
							"project-documents/" +
							value.projectId +
							"/inspections/"
					};
					await ProjectInspections.create(inspectionObj);
					// inspectionArray.push(inspectionObj);
					// callback();
				});

				// console.log(inspectionArray, "inspectionArray======");
				// await ProjectInspections.bulkCreate(inspectionArray);

				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_GATEWAY).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* get inspection-reports */
	const getInspections = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let inspectionCond = {};
			let pointCond = {};

			cond["isDeleted"] = 0;
			let inspectionRequired = false;
			inspectionCond["isDeleted"] = 0;
			if (reqObj.inspectionId) {
				inspectionRequired = true;
				inspectionCond["id"] = reqObj.inspectionId;
			}
			let pointRequired = false;
			pointCond["isDeleted"] = 0;
			if (reqObj.inspectionPointId) {
				pointRequired = true;
				pointCond["id"] = reqObj.inspectionPointId;
			}
			let mapCond = {};
			let mapRequired = false;
			mapCond["isDeleted"] = 0;
			if (reqObj.inspectionPointId) {
				// mapRequired = true;
				mapCond["inspectionPointId"] = reqObj.inspectionPointId;
			}

			if (reqObj.projectId) {
				cond["id"] = reqObj.projectId;
			}
			if (reqObj["searchTxt"]) {
				cond[Op.or] = [
					{
						title: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						description: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					}
				];
			}

			let attributes = { exclude: ["createdAt", "updatedAt"] };
			const page = reqObj.page ? reqObj.page : 1;
			const itemsPerPage = reqObj.itemsPerPage ? reqObj.itemsPerPage : 10;
			const offset = (page - 1) * itemsPerPage;
			let inspectionData = await Projects.findAndCountAll({
				where: cond,
				include: [
					{
						model: ProjectInspections,
						as: "inspections",
						where: inspectionCond,
						required: inspectionRequired,
						attributes: attributes,
						include: [
							{
								model: ProjectInspectionPoints,
								as: "points",
								where: pointCond,
								required: pointRequired,
								attributes: attributes
							},
							{
								model: ProjectInspectionPointMaps,
								as: "pointMaps",
								where: mapCond,
								required: mapRequired,
								attributes: attributes
							}
						]
					}
				],

				offset: offset,
				limit: itemsPerPage,
				attributes: attributes
			});

			if (_.size(inspectionData) <= 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
			let countData = await Projects.count({
				where: cond,
				offset: offset,
				limit: itemsPerPage
			});
			inspectionData.count = countData;
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: inspectionData
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* delete inspection-report */
	const deleteInspections = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (reqObj.inspectionId || reqObj.projectId) {
				let cond = {};
				let pointCond = {};
				let mapCond = {};
				if (reqObj.inspectionId) {
					let inspectionIds = reqObj.inspectionId.split(",");
					cond["id"] = inspectionIds;
					pointCond["inspectionId"] = inspectionIds;
					mapCond["inspectionId"] = inspectionIds;
				}
				if (reqObj.projectId) {
					cond["projectId"] = reqObj.projectId;
					pointCond["projectId"] = reqObj.projectId;
					mapCond["projectId"] = reqObj.projectId;
				}

				let updateObj = { isDeleted: 1, updatedAt: new Date() };
				await ProjectInspections.update(updateObj, {
					where: cond
				});
				await ProjectInspectionPoints.update(updateObj, {
					where: pointCond
				});
				await ProjectInspectionPointMaps.update(updateObj, {
					where: mapCond
				});

				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.DELETE_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* create inspection-report point */
	const createPoint = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			const pointData = reqObj.inspectionData;
			console.log(pointData, "pointData==============");

			if (pointData && pointData.length > 0) {
				await ProjectInspectionPoints.bulkCreate(pointData);
				if (
					pointData[0] &&
					pointData[0].inspectionId &&
					reqObj.markerImage
				) {
					await utils.generateFilePath(
						pointData[0].projectId,
						"inspections",
						reqObj.markerImage
					);
					await ProjectInspections.update(
						{ markerImage: reqObj.markerImage.filename },
						{ where: { id: pointData[0].inspectionId } }
					);
				}

				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_GATEWAY).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log("errr===>", err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* create inspection-report point details */
	const createPointDetails = async (req, res) => {
		try {
			const inspectionObj = utils.getReqValues(req);
			console.log(inspectionObj, "inspectionObj======");
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = inspectionObj.inspectionData
				? JSON.parse(inspectionObj.inspectionData)
				: [];

			if (reqObj && reqObj.length > 0) {
				let imageFiles = req.files.pointImages
					? req.files.pointImages
					: inspectionObj.pointImages
					? JSON.parse(inspectionObj.pointImages)
					: [];
				console.log(reqObj, "reqObj===============");
				let fileValues;
				reqObj.forEach(async value => {
					if (imageFiles && imageFiles.length > 0) {
						fileValues = _.filter(imageFiles, [
							"originalname",
							value.fileName
						]);
						let type = "inspection-defects";
						if (value && value.pointMapId) {
							type = "inspection-rectify";
						}
						await utils.generateFilePath(
							value.projectId,
							type,
							fileValues
						);
					}
					if (value && value.pointMapId) {
						let updateObj = {
							projectId: value.projectId,
							status: "resolved",
							replyDescription: value.description,
							rectifyImage: fileValues[0].originalname
								? fileValues[0].originalname
								: null,
							rectifyPath: `project-documents/${value.projectId}/inspections/rectify/`
						};

						await ProjectInspectionPointMaps.update(updateObj, {
							where: { id: value.pointMapId },
							returning: true
						});
						if (value.projectId) {
							await notification.create(
								value.projectId,
								"inspectionRectify"
							);
						}
					} else {
						let inspectionObj = {
							projectId: value.projectId,
							inspectionId: value.inspectionId,
							inspectionPointId: value.inspectionPointId,
							description: value.description,
							defectImage: fileValues[0].originalname
								? fileValues[0].originalname
								: null,
							defectPath: `project-documents/${value.projectId}/inspections/defects/`,
							title: value.name
						};
						await ProjectInspectionPointMaps.create(inspectionObj);
						if (value.projectId) {
							await notification.create(
								value.projectId,
								"inspectionDefect"
							);
						}
					}
				});
				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log("errr===>", err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* verify inspection-report */
	const verifyInspection = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let modeName = ProjectInspectionPointMaps;
			if (reqObj.type == "issue") {
				modeName = ProjectIssues;
			}
			await modeName
				.update(
					{ status: "approved", verifyDate: new Date() },
					{
						where: { id: reqObj.pointMapId },
						returning: true,
						raw: true,
						plain: true
					}
				)
				.then(async updatedData => {
					if (_.size(updatedData) > 0) {
						updatedData = updatedData.filter(value => {
							return value != undefined;
						});
						return res.status(httpStatus.OK).json({
							status: httpStatus.OK,
							message: label.UPDATE_SUCCESS,
							data: updatedData
						});
					}
				})
				.catch(err => {
					return res.status(httpStatus.BAD_REQUEST).json(err);
				});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* get notifications */
	const getNotifications = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let cond = {};
			cond["isDeleted"] = 0;
			if (reqObj.userId) {
				cond["userId"] = reqObj.userId;
			}
			let attributes = { exclude: ["createdAt", "updatedAt"] };
			const page = reqObj.page ? reqObj.page : 1;
			const itemsPerPage = reqObj.itemsPerPage ? reqObj.itemsPerPage : 10;
			const offset = (page - 1) * itemsPerPage;
			let notificationData = await Notifications.findAndCountAll({
				where: cond,
				include: [{ model: Users, attributes: attributes }],
				offset: offset,
				limit: itemsPerPage
			});
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: notificationData ? notificationData : []
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* delete notification */
	const deleteNotifications = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (reqObj.notificationId) {
				let notificationIds = reqObj.notificationId.split(",");
				await Notifications.update(
					{ isDeleted: 1, updatedAt: new Date() },
					{
						where: { id: { $in: notificationIds } }
					}
				);
				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.DELETE_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* create project-issue */
	const createIssues = async (req, res) => {
		try {
			const issueObj = utils.getReqValues(req);
			console.log(issueObj, "issueObj======");
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = issueObj.issueData
				? JSON.parse(issueObj.issueData)
				: [];

			if (reqObj && reqObj.length > 0) {
				let imageFiles = req.files.pointImages
					? req.files.pointImages
					: issueObj.pointImages
					? JSON.parse(issueObj.pointImages)
					: [];
				let fileValues;
				reqObj.forEach(async value => {
					if (imageFiles && imageFiles.length > 0) {
						fileValues = _.filter(imageFiles, [
							"originalname",
							value.fileName
						]);
						let type = "issue-defects";
						if (value && value.issueId) {
							type = "issue-rectify";
						}
						await utils.generateFilePath(
							value.projectId,
							type,
							fileValues
						);
					}
					if (value && value.issueId) {
						let updateObj = {
							projectId: value.projectId,
							status: "resolved",
							replyDescription: value.description,
							rectifyImage: value.fileName
								? value.fileName
								: null,
							rectifyPath: `project-documents/${value.projectId}/issues/rectify/`
						};
						if (value.projectId) {
							await notification.create(
								value.projectId,
								"rectifyIssue"
							);
						}
						await ProjectIssues.update(updateObj, {
							where: { id: value.issueId },
							returning: true
						});
					} else {
						let createObj = {
							projectId: value.projectId,
							description: value.description,
							defectImage: value.fileName ? value.fileName : null,
							defectPath: `project-documents/${value.projectId}/issues/defects/`,
							title: value.name
						};
						await ProjectIssues.create(createObj);
						if (value.projectId) {
							await notification.create(
								value.projectId,
								"createIssue"
							);
						}
					}
				});

				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.LABEL_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log("errr===>", err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* get project-issues */
	const getIssues = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let cond = {};
			cond["isDeleted"] = 0;
			if (reqObj.projectId) {
				cond["id"] = reqObj.projectId;
			}
			let issueCond = {};
			let issueReq = false;
			issueCond["isDeleted"] = 0;
			if (reqObj.projectId && reqObj.issueId) {
				issueReq = true;
				issueCond["id"] = reqObj.issueId;
				issueCond["projectId"] = reqObj.projectId;
			}

			if (reqObj["searchTxt"]) {
				cond[Op.or] = [
					{
						title: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						description: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					}
				];
			}

			let attributes = { exclude: ["createdAt", "updatedAt"] };
			const page = reqObj.page ? reqObj.page : 1;
			const itemsPerPage = reqObj.itemsPerPage ? reqObj.itemsPerPage : 10;
			const offset = (page - 1) * itemsPerPage;

			let issueData = await Projects.findAndCountAll({
				where: cond,
				include: [
					{
						model: ProjectIssues,
						where: issueCond,
						required: issueReq,
						attributes: attributes
					}
				],

				offset: offset,
				limit: itemsPerPage,
				attributes: attributes
			});
			if (_.size(issueData) <= 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
			let countData = await Projects.count({
				where: cond,
				offset: offset,
				limit: itemsPerPage
			});
			issueData.count = countData;
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: issueData ? issueData : []
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	const deleteIssues = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (reqObj.issueId || reqObj.projectId) {
				let cond = {};

				if (reqObj.issueId) {
					let issueIds = reqObj.issueId.split(",");
					cond["id"] = issueIds;
				}
				if (reqObj.projectId) {
					cond["projectId"] = reqObj.projectId;
				}

				let updateObj = { isDeleted: 1, updatedAt: new Date() };

				await ProjectIssues.update(updateObj, {
					where: cond
				});

				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.DELETE_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	const exportPdf = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let inspectionCond = {};
			let inspectionRequired = false;
			inspectionCond["isDeleted"] = 0;
			if (reqObj.inspectionId) {
				let inspectionIds = reqObj.inspectionId.split(",");
				inspectionRequired = true;
				inspectionCond["id"] = inspectionIds;
			}
			if (reqObj.projectId) {
				inspectionCond["projectId"] = reqObj.projectId;
			}
			let inspectionData = await Projects.findAll({
				where: { isDeleted: 0, id: reqObj.projectId },
				include: [
					{
						model: ProjectInspections,
						as: "inspections",
						required: inspectionRequired,
						where: inspectionCond,
						include: [
							{
								model: ProjectInspectionPoints,
								as: "points",
								where: { isDeleted: 0 },
								include: [
									{
										model: ProjectInspectionPointMaps,
										as: "pointMaps",
										where: {
											isDeleted: 0,
											status: "approved"
										}
									}
								]
							}
						]
					}
				]
			});

			let dataArray = [];
			if (inspectionData && inspectionData.length > 0) {
				inspectionData.forEach(value => {
					if (value.inspections && value.inspections.length > 0) {
						value.inspections.forEach(blockData => {
							if (
								blockData.points &&
								blockData.points.length > 0
							) {
								blockData.points.forEach(pointData => {
									let dataObj = {};

									dataObj = {
										projectTitle: value.title,
										location: value.location,
										imageName: value.imageName,
										blockName: blockData.name,
										markerImage: blockData.markerImage,
										blockImage: blockData.imageName,
										blockPath: blockData.path,
										pointName: pointData.pointName,
										pointProperties: pointData.pointMaps
											? pointData.pointMaps
											: []
									};
									dataArray.push(dataObj);
								});
							}
						});
					}
				});
			}
			if (dataArray && dataArray.length == 0) {
				inspectionData.forEach(value => {
					let dataObj = {
						projectTitle: value.title,
						location: value.location,
						imageName: value.imageName
					};
					dataArray.push(dataObj);
				});
			}
			console.log(JSON.stringify(dataArray), "dataArray=============");
			if (dataArray && dataArray.length > 0) {
				const html = path.resolve(
					"src/template/inspection-template.html"
				);
				utils.readHTMLFile(html, async (err, html) => {
					if (err) {
						console.log(err);
						return false;
					}
					var options = {
						format: "A4",
						orientation: "portrait",
						border: "10mm",
						timeout: "180000"
					};

					var document = {
						html: html,
						data: {
							inspectionArray: JSON.parse(
								JSON.stringify(dataArray)
							),
							imagePath: IMAGE_PATH,
							date: moment(new Date()).format("YYYY-MM-DD"),
							time: moment(new Date()).format("hh:mm a")
						}
					};

					return new Promise((resolve, reject) => {
						var html = Handlebars.compile(document.html)(
							document.data
						);
						pdf.create(html, options).toStream((err, stream) => {
							if (err) return res.end(err.stack);
							res.setHeader("Content-type", "application/pdf");
							res.writeHead(200, {
								"Content-disposition":
									"attachment; filename=inspection-report.pdf"
							});
							stream.pipe(res);
						});
					});
				});
			} else {
				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.NO_DATA
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	const dashboardReports = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let userData = await Users.findAndCountAll({
				where: { isDeleted: 0, role: { $in: ["staff", "contractor"] } }
			});
			let userObj = {};
			if (userData && userData.rows) {
				let users = _.groupBy(userData.rows, "role");

				userObj = {
					totalUsers: userData.count ? userData.count : 0,
					staffCount: users.staff ? users.staff.length : 0,
					contractorCount: users.contractor
						? users.contractor.length
						: 0
				};
			}
			let projectData = await Projects.findAndCountAll({
				where: { isDeleted: 0 }
			});
			let projectObj = {};
			if (projectData) {
				projectObj = {
					totalProjects: projectData.count ? projectData.count : 0
				};
			}
			let cond = {};
			cond["isDeleted"] = 0;
			if (reqObj.projectId) {
				let projectIds = reqObj.projectId.split(",");
				cond["projectId"] = projectIds;
			}
			let issueData = await ProjectIssues.findAndCountAll({
				where: cond
			});
			let issueObj = {};
			if (issueData && issueData.rows) {
				let defectsValue = 0;
				let rectifyValue = 0;
				issueData.rows.forEach(async value => {
					if (
						value.status == "pending" ||
						value.status == "resolved"
					) {
						defectsValue++;
					}
					if (value.status == "approved") {
						rectifyValue++;
					}
				});
				issueObj = {
					totalIssues: issueData.count ? issueData.count : 0,
					defects: defectsValue,
					rectification: rectifyValue
				};
			}
			let inspectionData = await ProjectInspectionPointMaps.findAndCountAll(
				{
					where: cond
				}
			);

			let inspectionObj = {};
			if (inspectionData && inspectionData.rows) {
				let defectsValue = 0;
				let rectifyValue = 0;
				inspectionData.rows.forEach(async value => {
					if (
						value.status == "pending" ||
						value.status == "resolved"
					) {
						defectsValue++;
					}
					if (value.status == "approved") {
						rectifyValue++;
					}
				});
				inspectionObj = {
					totalInspection: inspectionData.count
						? inspectionData.count
						: 0,
					defects: defectsValue,
					rectification: rectifyValue
				};
			}
			let reportObj = {
				userData: userObj,
				projectData: projectObj,
				issueData: issueObj,
				inspectionData: inspectionObj
			};

			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: reportObj ? reportObj : []
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	const updateSettings = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			if (reqObj.settingId) {
				let updateObj = {
					status: reqObj.status ? reqObj.status : false
				};

				await Settings.update(updateObj, {
					where: { id: reqObj["settingId"] }
				});

				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.UPDATE_SUCCESS
				});
			} else {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	const getSettings = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let attributes = { exclude: ["createdAt", "updatedAt"] };
			let settingData = await Settings.findAll({
				where: { isDeleted: 0 },
				attributes: attributes
			});
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: settingData
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};
	return {
		create,
		getInspections,
		deleteInspections,
		createPoint,
		createPointDetails,
		getNotifications,
		deleteNotifications,
		verifyInspection,
		createIssues,
		getIssues,
		deleteIssues,
		exportPdf,
		dashboardReports,
		updateSettings,
		getSettings
	};
};
export default SharedController();
