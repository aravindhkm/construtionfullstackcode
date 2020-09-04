import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import db from "../../config/sequelize";
import utils from "../services/utils.service";
import label from "../../config/resources";
import config from "../../config/config";
import moment from "moment";
import path from "path";
import Handlebars from "handlebars";
import pdf from "html-pdf";

const { Projects, ProjectSurveys, SurveyProperties, SurveyPropertyMaps } = db;
const Op = db.Sequelize.Op;
const IMAGE_PATH = config.PROTOCAL + config.BASE_URL + ":" + config.port + "/";

const SurveyController = () => {
	/* create condition-survey */
	const create = async (req, res) => {
		try {
			const surveyObj = utils.getReqValues(req);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = JSON.parse(surveyObj.surveyData);
			if (reqObj && reqObj.length > 0) {
				let imageFiles = req.files.images
					? req.files.images
					: surveyObj.images
					? JSON.parse(surveyObj.images)
					: [];

				console.log(reqObj, "reqObj===============");
				let fileValues;
				reqObj.forEach(async value => {
					if (imageFiles && imageFiles.length > 0) {
						fileValues = _.filter(imageFiles, [
							"originalname",
							value.fileName
						]);
						await utils.generateFilePath(
							value.projectId,
							"condition-survey",
							fileValues
						);
					}
					let createObj = {
						projectId: value.projectId,
						imageName:
							fileValues[0] && fileValues[0].originalname
								? fileValues[0].originalname
								: null,
						name: value.name,
						surveyType: "condition",
						imagePath:
							"project-documents/" +
							value.projectId +
							"/condition-survey/"
					};
					await ProjectSurveys.create(createObj);
				});
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

	/* get condition / pre-conidtion surveys */
	const getSurveys = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let surveyCond = {};
			let propCond = {};

			cond["isDeleted"] = 0;
			let surveyRequired = false;
			surveyCond["isDeleted"] = 0;
			if (reqObj.surveyId) {
				surveyRequired = true;
				surveyCond["id"] = reqObj.surveyId;
			}
			if (reqObj.type) {
				surveyCond["surveyType"] = reqObj.type;
			}
			let propRequired = false;
			propCond["isDeleted"] = 0;
			if (reqObj.propertyId) {
				propRequired = true;
				propCond["id"] = reqObj.propertyId;
			}
			let mapCond = {};
			let mapRequired = false;
			mapCond["isDeleted"] = 0;
			if (reqObj.propertyId) {
				// mapRequired = true;
				mapCond["propertyId"] = reqObj.propertyId;
			}

			if (reqObj.projectId) {
				cond["id"] = reqObj.projectId;
			}

			if (reqObj["searchTxt"] && reqObj.propertyId && reqObj.surveyId) {
				mapCond[Op.or] = [
					{
						name: {
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
			if (reqObj["searchTxt"] && !reqObj.propertyId && !reqObj.surveyId) {
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
			let surveyData = await Projects.findAndCountAll({
				where: cond,
				include: [
					{
						model: ProjectSurveys,
						where: surveyCond,
						required: surveyRequired,
						attributes: attributes,
						include: [
							{
								model: SurveyProperties,
								where: propCond,
								required: propRequired,
								attributes: attributes
							},
							{
								model: SurveyPropertyMaps,
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

			if (_.size(surveyData) <= 0) {
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
			surveyData.count = countData;
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: surveyData
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* delete condition / pre-conidtion survey */
	const deleteSurvey = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let updateObj = { isDeleted: 1, updatedAt: new Date() };

			if (reqObj.surveyId || reqObj.projectId || reqObj.propertyId) {
				let cond = {};
				let propCond = {};
				let mapCond = {};
				if (reqObj.surveyType) {
					cond["surveyType"] = reqObj.surveyType;
				}
				if (reqObj.surveyId) {
					let surveyIds = reqObj.surveyId.split(",");
					cond["id"] = surveyIds;
					propCond["surveyId"] = surveyIds;
					mapCond["surveyId"] = surveyIds;
				}
				if (reqObj.projectId) {
					cond["projectId"] = reqObj.projectId;
					propCond["projectId"] = reqObj.projectId;
					mapCond["projectId"] = reqObj.projectId;
				}

				if (reqObj.propertyId) {
					let propertyIds = reqObj.propertyId.split(",");
					await SurveyProperties.destroy({
						where: { id: propertyIds }
					});
				}
				if (reqObj.surveyId || reqObj.projectId) {
					await ProjectSurveys.update(updateObj, {
						where: cond
					});

					await SurveyProperties.update(updateObj, {
						where: propCond
					});
					await SurveyPropertyMaps.update(updateObj, {
						where: mapCond
					});
				}

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

	/* create  condition / pre-conidtion survey property */
	const createProperty = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			const propData = reqObj.surveyData;
			console.log(propData, "propData==============");

			if (propData && propData.length > 0) {
				if (propData[0] && propData[0].surveyId && reqObj.markerImage) {
					await utils.generateFilePath(
						propData[0].projectId,
						"condition-survey",
						reqObj.markerImage
					);
					await ProjectSurveys.update(
						{ markerImage: reqObj.markerImage.filename },
						{ where: { id: propData[0].surveyId } }
					);
				}
				propData.forEach(async value => {
					if (value.propertyId) {
						await SurveyProperties.destroy({
							where: { id: value.propertyId }
						});
					}
					let surveyId;
					if (!value.surveyId) {
						surveyId = await _createSurvey(value.projectId);
					}
					let createObj = {
						projectId: value.projectId,
						surveyId: value.surveyId ? value.surveyId : surveyId,
						name: value.name ? value.name : null,
						coordinates: value.coordinates ? value.coordinates : []
					};

					await SurveyProperties.create(createObj);
				});
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

	/* create condition survey property details */
	const conditionProperty = async (req, res) => {
		try {
			const surveyObj = utils.getReqValues(req);
			console.log(surveyObj, "surveyObj======");
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = surveyObj.surveyData
				? JSON.parse(surveyObj.surveyData)
				: [];
			if (reqObj && reqObj.length > 0) {
				let fileValues, imageName;
				let imageFiles = req.files.propertyImages
					? req.files.propertyImages
					: surveyObj.propertyImages
					? JSON.parse(surveyObj.propertyImages)
					: [];
				reqObj.forEach(async value => {
					if (imageFiles && imageFiles.length > 0) {
						fileValues = _.filter(imageFiles, [
							"originalname",
							value.fileName
						]);
						await utils.generateFilePath(
							value.projectId,
							"condition",
							fileValues
						);
					}
					let createObj = {
						projectId: value.projectId,
						surveyId: value.surveyId,
						propertyId: value.propertyId,
						imageName: value.fileName ? value.fileName : [],
						name: value.name,
						imagePath:
							"surveys/" +
							value.projectId +
							"/condition-survey/point-images/"
					};
					if (value.propertyMapId) {
						let propertyData = await SurveyPropertyMaps.findOne({
							where: { id: value.propertyMapId },
							returning: true
						});
						if (propertyData && propertyData.imageName) {
							imageName =
								fileValues[0] && fileValues[0].originalname
									? fileValues[0].originalname
									: propertyData.imageName;
						}
						createObj.imageName = imageName;
						await SurveyPropertyMaps.update(createObj, {
							where: { id: value.propertyMapId },
							returning: true
						});
					} else {
						await SurveyPropertyMaps.create(createObj);
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

	/* create pre-conidtion survey property details */
	const preConditionProperty = async (req, res) => {
		try {
			const surveyObj = utils.getReqValues(req);
			console.log(surveyObj, "surveyObj======");
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = surveyObj.surveyData
				? JSON.parse(surveyObj.surveyData)
				: [];

			if (reqObj && reqObj.length > 0) {
				let fileValues, imageName;
				let imageFiles = req.files.propertyImages
					? req.files.propertyImages
					: surveyObj.propertyImages
					? JSON.parse(surveyObj.propertyImages)
					: [];
				reqObj.forEach(async value => {
					if (imageFiles && imageFiles.length > 0) {
						fileValues = _.filter(imageFiles, [
							"originalname",
							value.fileName
						]);
						await utils.generateFilePath(
							value.projectId,
							"pre-condition",
							fileValues
						);
					}
					let createObj = {
						projectId: value.projectId,
						surveyId: value.surveyId,
						propertyId: value.propertyId,
						imageName: value.fileName ? value.fileName : [],
						name: value.name,
						description: value.description,
						imagePath:
							"surveys/" +
							value.projectId +
							"/pre-condition-survey/drop-images/"
					};
					if (value.propertyMapId) {
						let propertyData = await SurveyPropertyMaps.findOne({
							where: { id: value.propertyMapId },
							returning: true
						});
						if (propertyData && propertyData.imageName) {
							imageName =
								fileValues[0] && fileValues[0].originalname
									? fileValues[0].originalname
									: propertyData.imageName;
						}
						createObj.imageName = imageName;
						await SurveyPropertyMaps.update(createObj, {
							where: { id: value.propertyMapId },
							returning: true
						});
					} else {
						await SurveyPropertyMaps.create(createObj);
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

	/* create pre-conidtion survey */
	const _createSurvey = async projectId => {
		let surveyId;
		await ProjectSurveys.findOne({
			where: {
				projectId: projectId,
				surveyType: "pre-condition",
				isDeleted: 0
			},
			returning: true
		}).then(async response => {
			surveyId = response && response.id ? response.id : null;
			if (!response) {
				let surveyObj = {
					projectId: projectId,
					surveyType: "pre-condition"
				};
				let createdData = await ProjectSurveys.create(surveyObj);

				surveyId =
					createdData && createdData.id ? createdData.id : null;
			}
		});

		return surveyId;
	};

	const exportPdf = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let surveyCond = {};
			let propCond = {};
			let surveyRequired = false;
			surveyCond["isDeleted"] = 0;
			surveyCond["surveyType"] = reqObj.surveyType;
			if (reqObj.surveyId) {
				let surveyIds = reqObj.surveyId.split(",");
				surveyRequired = true;
				surveyCond["id"] = surveyIds;
			}
			if (reqObj.projectId) {
				surveyCond["projectId"] = reqObj.projectId;
			}
			let propRequired = false;
			propCond["isDeleted"] = 0;
			if (reqObj.propertyId && reqObj.surveyType == "pre-condition") {
				propRequired = true;
				let propertyIds = reqObj.propertyId.split(",");
				propCond["id"] = propertyIds;
			}
			let surveyData = await Projects.findAll({
				where: { isDeleted: 0, id: reqObj.projectId },
				include: [
					{
						model: ProjectSurveys,
						where: surveyCond,
						required: surveyRequired,
						include: [
							{
								model: SurveyProperties,
								required: propRequired,
								where: propCond,
								include: [
									{
										model: SurveyPropertyMaps,
										where: { isDeleted: 0 }
									}
								]
							}
						]
					}
				]
			});

			let dataArray = [];
			if (surveyData && surveyData.length > 0) {
				surveyData.forEach(value => {
					if (
						value.ProjectSurveys &&
						value.ProjectSurveys.length > 0
					) {
						value.ProjectSurveys.forEach(blockData => {
							if (
								blockData.SurveyProperties &&
								blockData.SurveyProperties.length > 0
							) {
								blockData.SurveyProperties.forEach(
									pointData => {
										let dataObj = {};

										dataObj = {
											projectTitle: value.title,
											location: value.location,
											imageName:
												IMAGE_PATH +
												"projects/" +
												value.imageName,
											description: value.description,
											blockName: blockData.name,
											markerImage: blockData.markerImage,
											blockImage: blockData.imageName,
											blockPath: blockData.imagePath,
											pointName: pointData.name,
											pointProperties: pointData.SurveyPropertyMaps
												? pointData.SurveyPropertyMaps
												: []
										};
										dataArray.push(dataObj);
									}
								);
							}
						});
					}
				});
			}
			if (dataArray && dataArray.length == 0) {
				surveyData.forEach(value => {
					let dataObj = {
						projectTitle: value.title,
						location: value.location,
						imageName: IMAGE_PATH + "projects/" + value.imageName
					};
					dataArray.push(dataObj);
				});
			}
			console.log(JSON.stringify(dataArray), "dataArray=============");
			if (dataArray && dataArray.length > 0) {
				var html, fileName;
				if (reqObj.surveyType == "condition") {
					html = path.resolve(
						"src/template/condition-survey-template.html"
					);
					fileName = "condition-survey";
				} else {
					html = path.resolve(
						"src/template/pre-condition-survey-template.html"
					);
					fileName = "pre-condition-survey";
				}
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
							conditionArray: JSON.parse(
								JSON.stringify(dataArray)
							),
							imagePath: IMAGE_PATH,
							date: moment(new Date()).format("YYYY-MM-DD"),
							time: moment(new Date()).format("hh:mm a"),
							firstView: reqObj.type == "single" ? true : false,
							secondView: reqObj.type == "two" ? true : false,
							thirdView: reqObj.type == "three" ? true : false
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
									"attachment; filename=" + fileName + ".pdf"
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
	return {
		create,
		getSurveys,
		deleteSurvey,
		createProperty,
		conditionProperty,
		preConditionProperty,
		exportPdf
	};
};
export default SurveyController();
