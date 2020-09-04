import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import async from "async";
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
	ProjectMonitors,
	ProjectMonitorValues,
	ProjectMonitorValueMaps
} = db;
const Op = db.Sequelize.Op;

const MonitorController = () => {
	/* create work-monitor */
	const create = async (req, res) => {
		try {
			const monitorObj = utils.getReqValues(req);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = JSON.parse(monitorObj.monitorData);
			let monitorArray = [];
			if (reqObj && reqObj.length > 0) {
				let monitorFiles =
					req.files && req.files.monitors
						? req.files.monitors
						: monitorObj.monitors
						? JSON.parse(monitorObj.monitors)
						: [];
				let fileValues;
				await async.eachSeries(reqObj, async (value, callback) => {
					if (monitorFiles && monitorFiles.length > 0) {
						fileValues = _.filter(monitorFiles, [
							"originalname",
							value.fileName
						]);
						await utils.generateFilePath(
							value.projectId,
							"work-monitors",
							fileValues
						);
					}
					let monitorObj = {
						projectId: value.projectId,
						imageName:
							fileValues[0] && fileValues[0].originalname
								? fileValues[0].originalname
								: null,
						path:
							"project-documents/" +
							value.projectId +
							"/work-monitors/",
						title: value.title
					};
					monitorArray.push(monitorObj);
					callback();
				});
				await ProjectMonitors.bulkCreate(monitorArray);
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
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* get work monitors */
	const getWorkMonitors = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let monitorCond = {};
			let valCond = {};

			cond["isDeleted"] = 0;
			let monitorRequired = false;
			monitorCond["isDeleted"] = 0;
			if (reqObj.monitorId) {
				monitorRequired = true;
				monitorCond["id"] = reqObj.monitorId;
			}
			let valueRequired = false;
			valCond["isDeleted"] = 0;
			if (reqObj.monitorValueId) {
				valueRequired = true;
				valCond["id"] = reqObj.monitorValueId;
			}
			let mapCond = {};
			let mapRequired = false;
			mapCond["isDeleted"] = 0;
			if (reqObj.monitorValueId) {
				// mapRequired = true;
				mapCond["monitorValueId"] = reqObj.monitorValueId;
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
			let monitorData = await Projects.findAndCountAll({
				where: cond,
				include: [
					{
						model: ProjectMonitors,
						as: "monitors",
						where: monitorCond,
						required: monitorRequired,
						attributes: attributes,
						include: [
							{
								model: ProjectMonitorValues,
								as: "monitorValue",
								where: valCond,
								required: valueRequired,
								attributes: attributes
							},
							{
								model: ProjectMonitorValueMaps,
								as: "mapValue",
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

			if (_.size(monitorData) <= 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
			let countData = await Projects.count({
				where: cond
			});
			monitorData.count = countData;
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: monitorData
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* delete work-monitor */
	const deleteWorkMonitor = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.monitorId || reqObj.projectId) {
				let cond = {};
				let valCond = {};
				let mapCond = {};
				if (reqObj.monitorId) {
					let monitorIds = reqObj.monitorId.split(",");
					cond["id"] = monitorIds;
					valCond["monitorId"] = monitorIds;
					mapCond["monitorId"] = monitorIds;
				}
				if (reqObj.projectId) {
					cond["projectId"] = reqObj.projectId;
					valCond["projectId"] = reqObj.projectId;
					mapCond["projectId"] = reqObj.projectId;
				}

				let updateObj = { isDeleted: 1, updatedAt: new Date() };
				await ProjectMonitors.update(updateObj, {
					where: cond
				});
				if (reqObj.monitorValueId) {
					let monitorValueIds = reqObj.monitorValueId.split(",");
					await ProjectMonitorValues.destroy({
						where: { id: monitorValueIds }
					});
				}
				await ProjectMonitorValues.update(updateObj, {
					where: valCond
				});

				await ProjectMonitorValueMaps.update(updateObj, {
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
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* create work-monitor drop */
	const createDrop = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			const dropData = reqObj.monitorData;
			if (dropData && dropData.length > 0) {
				/*dropData.forEach(async value => {
					if (value.monitorId) {
						await ProjectMonitorValues.destroy({
							where: { monitorId: value.monitorId }
						});
					}
				});*/
				await ProjectMonitorValues.bulkCreate(dropData);
				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.LABEL_SUCCESS
				});
			}
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* create work-monitor drop properties */
	const createDropValue = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			const dropValueData = reqObj.monitorData;

			if (dropValueData && dropValueData.length > 0) {
				/*dropValueData.forEach(async value => {
					if (value.monitorValueId) {
						await ProjectMonitorValueMaps.destroy({
							where: { monitorValueId: value.monitorValueId }
						});
					}
				});*/
				await ProjectMonitorValueMaps.bulkCreate(dropValueData);
				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.LABEL_SUCCESS
				});
			}
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* create work-monitor drop properties images */
	const createDropValueImages = async (req, res) => {
		try {
			const valueObj = utils.getReqValues(req);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}

			const reqObj = JSON.parse(valueObj.monitorData);
			if (reqObj && reqObj.length > 0) {
				let imageValues = req.files.monitorValues
					? req.files.monitorValues
					: valueObj.monitorValues
					? JSON.parse(valueObj.monitorValues)
					: [];
				let imageDatas;
				if (imageValues && imageValues.length > 0) {
					imageDatas = _.map(imageValues, "filename");
					imageValues.forEach(async value => {
						await utils.generateFilePath(
							reqObj[0]["projectId"],
							"work-monitor-drop-images",
							value
						);
					});
				}

				if (reqObj[0]["monitorValueMapId"]) {
					let monitorValue = await ProjectMonitorValueMaps.findOne({
						where: { id: reqObj[0]["monitorValueMapId"] },
						returning: true
					});
					if (monitorValue && monitorValue.imageName) {
						imageDatas = _.concat(
							imageDatas,
							monitorValue.imageName
						);
					}
					let updateObj = {
						imageName:
							imageDatas && imageDatas.length > 0
								? imageDatas
								: monitorValue && monitorValue.imageName
								? monitorValue.imageName
								: [],
						path:
							"project-documents/" +
							reqObj[0]["projectId"] +
							"/work-monitors/drop-images/"
					};

					await ProjectMonitorValueMaps.update(updateObj, {
						where: { id: reqObj[0]["monitorValueMapId"] },
						returning: true
					});

					if (reqObj[0] && reqObj[0]["projectId"]) {
						await notification.create(
							reqObj[0]["projectId"],
							"monitor"
						);
					}
				}

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
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* work-monitor pdf export */
	const exportPdf = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let monitorCond = {};
			let monitorRequired = false;
			monitorCond["isDeleted"] = 0;
			if (reqObj.monitorId) {
				let monitorIds = reqObj.monitorId.split(",");
				monitorRequired = true;
				monitorCond["id"] = monitorIds;
			}
			let valCond = {};
			let valueRequired = false;
			valCond["isDeleted"] = 0;
			if (reqObj.monitorValueId) {
				let monitorValueIds = reqObj.monitorValueId.split(",");
				valueRequired = true;
				valCond["id"] = monitorValueIds;
			}
			if (reqObj.projectId) {
				monitorCond["projectId"] = reqObj.projectId;
			}
			let monitorData = await Projects.findAll({
				where: { isDeleted: 0, id: reqObj.projectId },
				include: [
					{
						model: ProjectMonitors,
						as: "monitors",
						required: monitorRequired,
						where: monitorCond,
						include: [
							{
								model: ProjectMonitorValues,
								as: "monitorValue",
								required: valueRequired,
								where: valCond,
								include: [
									{
										model: ProjectMonitorValueMaps,
										as: "mapValue",
										where: { isDeleted: 0 }
									}
								]
							}
						]
					}
				]
			});

			let dataArray = [];
			if (monitorData && monitorData.length > 0) {
				monitorData.forEach(value => {
					if (value.monitors && value.monitors.length > 0) {
						value.monitors.forEach(blockData => {
							if (
								blockData.monitorValue &&
								blockData.monitorValue.length > 0
							) {
								blockData.monitorValue.forEach(dropData => {
									let dataObj = {};

									dataObj = {
										projectTitle: value.title,
										location: value.location,
										imageName: value.imageName,
										blockName: blockData.title,
										blockImage: blockData.imageName,
										blockPath: blockData.path,
										dropName: dropData.name,
										dropValues: dropData.mapValue
											? dropData.mapValue
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
				monitorData.forEach(value => {
					let dataObj = {
						projectTitle: value.title,
						location: value.location,
						imageName: value.imageName
					};
					dataArray.push(dataObj);
				});
			}
			if (dataArray && dataArray.length > 0) {
				const html = path.resolve(
					"src/template/work-monitor-template.html"
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
							monitorArray: JSON.parse(JSON.stringify(dataArray)),
							imagePath: IMAGE_PATH,
							firstView: reqObj.type == "single" ? true : false,
							secondView: reqObj.type == "two" ? true : false,
							thirdView: reqObj.type == "three" ? true : false
						}
					};

					return new Promise((resolve, reject) => {
						// if (!document.html || !document.data) {
						// 	reject(new Error("Some, or all, options are missing."));
						// }
						// Compiles a template
						var html = Handlebars.compile(document.html)(
							document.data
						);
						pdf.create(html, options).toStream((err, stream) => {
							if (err) return res.end(err.stack);
							res.setHeader("Content-type", "application/pdf");
							res.writeHead(200, {
								"Content-disposition":
									"attachment; filename=work-monitor-report.pdf"
							});
							stream.pipe(res);
						});
						// Create PDF from html template generated by handlebars
						// Output will be PDF file
						// pdfPromise.toFile("../template/output.pdf", (err, res) => {
						// 	console.log(res, "res===========");
						// 	if (!err) resolve(res);
						// 	else reject(err);
						// });
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
		getWorkMonitors,
		deleteWorkMonitor,
		createDrop,
		createDropValue,
		createDropValueImages,
		exportPdf
	};
};
export default MonitorController();
