import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import fs from "fs";
import archiver from "archiver";
import db from "../../config/sequelize";
import utils from "../services/utils.service";
import label from "../../config/resources";
import config from "../../config/config";
import notification from "../services/notification.service";

const { Actions, Projects, ProjectDocuments, ProjectDocumentMaps } = db;
const Op = db.Sequelize.Op;
import { promisify } from "util";
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const DocumentController = () => {
	/* create / update documents */
	const create = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const documentObj = utils.getReqValues(req);
			const reqObj = documentObj.documentsData
				? JSON.parse(documentObj.documentsData)
				: [];
			const imageDatas = documentObj.imageName
				? JSON.parse(documentObj.imageName)
				: null;
			console.log(reqObj, "reqObj=========");
			if ((reqObj && reqObj.length > 0) || imageDatas) {
				let documentFiles =
					req.files && req.files.documents
						? req.files.documents
						: documentObj.documents
						? JSON.parse(documentObj.documents)
						: [];
				let otherDocuments = [];
				let documentValues = [];
				if (reqObj && reqObj.length > 0) {
					reqObj.forEach(element => {
						if (element.type && element.type == "document") {
							documentValues.push(element);
						} else {
							otherDocuments.push(element);
						}
					});

					console.log(documentValues, "documentValues=======");
					if (documentValues && documentValues.length > 0) {
						let documentArray = _.groupBy(
							documentValues,
							"actionId"
						);
						let documentKeys = _.keys(documentArray);
						// if (documentFiles && documentFiles.length > 0) {
						for (let i = 0; i < documentKeys.length; i++) {
							if (
								_.some(
									documentArray[documentKeys[i]],
									"actionId"
								)
							) {
								if (
									_.some(documentArray[documentKeys[i]], {
										actionType: "single"
									}) &&
									documentArray[documentKeys[i]].length === 1
								) {
									// create / update single upload document
									await _createSingleDocument(
										documentArray[documentKeys[i]],
										documentFiles
									);
								} else {
									if (
										_.some(documentArray[documentKeys[i]], {
											actionType: "multiple"
										})
									) {
										// create / update multiple upload document
										await _createMultipleDocument(
											documentArray[documentKeys[i]],
											documentFiles,
											"document"
										);
									}
								}
							} else {
								if (
									documentArray[documentKeys[i]] &&
									documentArray[documentKeys[i]].length > 0
								) {
									let otherValues =
										documentArray[documentKeys[i]];
									console.log(
										otherValues,
										"withput============="
									);
									for (
										let j = 0;
										j < otherValues.length;
										j++
									) {
										await _createOtherDocument(
											otherValues[j],
											documentFiles
										);
									}
								}
							}
						}
						// }
					}
					if (otherDocuments && otherDocuments.length > 0) {
						let newFiles =
							req.files && req.files.newDocuments
								? req.files.newDocuments
								: documentObj.newDocuments
								? JSON.parse(documentObj.newDocuments)
								: [];
						// if (newFiles && newFiles.length > 0) {
						for (let i = 0; i < otherDocuments.length; i++) {
							if (
								otherDocuments[i] &&
								otherDocuments[i].actionType === "single"
							) {
								// create / update other upload document
								await _createOtherDocument(
									otherDocuments[i],
									newFiles
								);
							}
						}
						// }
					}
				}
				// create / update document images
				let documentImages =
					req.files && req.files.docImages
						? req.files.docImages
						: documentObj.docImages
						? JSON.parse(documentObj.docImages)
						: [];
				if (imageDatas && imageDatas.projectId) {
					let imageName = imageDatas.imageValue;
					// let imageValues = await ProjectDocuments.findOne({
					// 	where: { projectId: imageDatas.projectId }
					// });
					// if (
					// 	imageDatas.imageValue &&
					// 	imageDatas.imageValue.length > 0
					// ) {

					// } else {
					// 	imageName =
					// 		imageValues && imageValues.imageName
					// 			? imageValues.imageName
					// 			: [];
					// }

					await _updateImage(
						documentImages,
						imageName,
						imageDatas.projectId
					);
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
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* create / update single document */
	const _createSingleDocument = async (documentArray, documentFiles) => {
		if (
			documentFiles &&
			documentFiles.length > 0 &&
			_.some(documentFiles, "originalname")
		) {
			if (documentArray[0] && documentArray[0].fileName) {
				documentArray[0].fileName.forEach(async value => {
					let fileValues = _.filter(documentFiles, [
						"originalname",
						value
					]);
					await utils.generateFilePath(
						documentArray[0].projectId,
						documentArray[0].type,
						fileValues
					);
				});
			}
		}
		let actionId = documentArray[0].actionId;
		if (documentArray[0] && documentArray[0].projectId) {
			await notification.create(
				documentArray[0].projectId,
				documentArray[0].type
			);
		}
		let documentObj = {
			projectId: documentArray[0].projectId,
			name: documentArray[0].fieldName
				? documentArray[0].fieldName
				: null,
			actionId: actionId ? actionId : null,
			documentType:
				documentArray && documentArray[0]
					? documentArray[0].type
					: null,
			documentName:
				documentArray && documentArray[0]
					? documentArray[0].fileName
					: null,
			fileName: [],
			path:
				"project-documents/" +
				documentArray[0].projectId +
				"/" +
				documentArray[0].type +
				"/"
		};

		await ProjectDocuments.findOne({
			where: {
				actionId: actionId,
				projectId: documentArray[0].projectId
			},
			returning: true
		})
			.then(async response => {
				if (!response) {
					await ProjectDocuments.create(documentObj);
				} else {
					if (documentArray[0].projectId && actionId) {
						await ProjectDocuments.destroy({
							where: {
								actionId: actionId,
								projectId: documentArray[0].projectId
							}
						});
						await ProjectDocuments.create(documentObj);
					}
					return true;
				}
			})
			.catch(err => {
				console.log(err);
			});

		return true;
	};

	/* create / update multiple document */
	const _createMultipleDocument = async (
		documentArray,
		documentFiles,
		type
	) => {
		if (documentArray && documentArray.length > 0) {
			let docName = documentArray[0].name
				? documentArray[0].name
				: documentArray[0].fieldName;
			let actionId;
			let cond = {};
			cond["isDeleted"] = 0;
			cond["projectId"] = documentArray[0].projectId;
			if (type == "document") {
				actionId = documentArray[0].actionId;
				cond["actionId"] = actionId;
			} else {
				if (documentArray[0] && documentArray[0].documentId) {
					cond["id"] = documentArray[0].documentId;
				} else {
					cond["documentName"] = docName;
				}
			}
			await ProjectDocuments.findOne({
				where: cond,
				returning: true
			})
				.then(async response => {
					if (!response) {
						let documentObj = {
							projectId: documentArray[0].projectId,
							name: docName ? docName : null,
							remarks: documentArray[0].remarks
								? documentArray[0].remarks
								: null,
							actionId: actionId ? actionId : null,
							documentType:
								documentArray && documentArray[0]
									? documentArray[0].type
									: null,
							documentName: docName ? docName : "Document1"
						};
						await ProjectDocuments.create(documentObj)
							.then(async createdData => {
								await _updateMultipleDocument(
									documentArray,
									documentFiles,
									createdData
								);
							})
							.catch(err => {
								console.log(err);
							});
					} else {
						await _updateMultipleDocument(
							documentArray,
							documentFiles,
							response
						);
					}
				})
				.catch(err => {
					console.log(err);
				});
			return true;
		}
	};

	/* update multiple document */
	const _updateMultipleDocument = async (
		documentArray,
		documentFiles,
		response
	) => {
		if (documentArray) {
			documentArray.forEach(async subValue => {
				if (subValue.documentId) {
					let remark = subValue.remarks ? subValue.remarks : null;
					let docName = subValue.name ? subValue.name : null;
					await ProjectDocuments.update(
						{
							documentName: docName,
							name: docName,
							remarks: remark
						},
						{
							where: { id: subValue.documentId }
						}
					);
				}
				// let subValueArray = [];
				if (
					subValue.fileName ||
					(documentFiles && documentFiles.length > 0)
				) {
					subValue.fileName.forEach(async value => {
						let fileValues = _.filter(documentFiles, [
							"originalname",
							value
						]);

						await utils.generateFilePath(
							subValue.projectId,
							subValue.type,
							fileValues
						);
					});
					if (subValue.documentId) {
						await ProjectDocumentMaps.destroy({
							where: { id: subValue.documentId }
						});
					}

					let docMapObj = {
						projectId: subValue.projectId,
						documentId: response.id,
						documentType: subValue.type ? subValue.type : null,
						documentName: subValue.fileName
							? subValue.fileName
							: [],
						fileName: [],
						path:
							"project-documents/" +
							subValue.projectId +
							"/" +
							subValue.type +
							"/"
					};
					await ProjectDocumentMaps.create(docMapObj);
				}
			});
		}
		if (documentArray[0] && documentArray[0].projectId) {
			await notification.create(
				documentArray[0].projectId,
				documentArray[0].type
			);
		}
		return true;
	};

	/* update document images */
	const _updateImage = async (documentImages, name, projectId) => {
		let imageName;
		if (documentImages.length > 0) {
			documentImages.forEach(async value => {
				const buffer = await readFile(value.path);
				let dir_name =
					config.uploadPath +
					"server/uploads" +
					"/project-documents/images/";
				let filename = `${dir_name}${value.originalname}`;
				await writeFile(filename, buffer);
				await utils.unLinkFilePath(value.path);
			});
			let imageDatas = _.map(documentImages, "originalname");
			if (name) {
				imageDatas = _.concat(imageDatas, name);
			}
			imageName = imageDatas && imageDatas.length > 0 ? imageDatas : [];
			console.log(imageName, "IfimageName=============");
		} else {
			imageName = name;
			console.log(imageName, "ElseimageName=============");
		}

		await ProjectDocuments.update(
			{ imageName: imageName },
			{
				where: { projectId: projectId },
				returning: true
			}
		);
		return true;
	};

	/* get documents */
	const getDocuments = async (req, res) => {
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
			let docCond = {};
			let docRequired = false;
			if (reqObj.type == "soi") {
				docCond["documentType"] = { $in: ["soi", "vo", "others-soi"] };
				docRequired = true;
			} else if (reqObj.type == "claims") {
				docCond["documentType"] = { $in: ["claims", "others-claims"] };
				docRequired = true;
			} else if (reqObj.type == "tds") {
				docCond["documentType"] = {
					$in: ["tds", "msds", "others-tds"]
				};
				docRequired = true;
			} else {
				docCond["documentType"] = "document";
				docRequired = true;
			}
			/*if (reqObj.dateValue) {
				dateCond = db.sequelize.where(
					db.sequelize.fn(
						"date",
						db.sequelize.col("ProjectDocuments.createdAt")
					),
					"=",
					reqObj.dateValue
				);
			}*/
			// let attributes = {
			// 	exclude: ["createdAt", "updatedAt"]
			// };
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
			const page = reqObj.page ? reqObj.page : 1;
			const itemsPerPage = reqObj.itemsPerPage ? reqObj.itemsPerPage : 10;
			const offset = (page - 1) * itemsPerPage;

			let documentData = await Projects.findAndCountAll({
				where: cond,
				include: [
					{
						model: ProjectDocuments,
						where: docCond,
						required: docRequired,
						// attributes: attributes,
						include: [
							{
								model: ProjectDocumentMaps,
								required: false
								// attributes: attributes
							}
						]
					}
				],

				offset: offset,
				limit: itemsPerPage,
				// attributes: attributes,
				order: [[ProjectDocuments, "id", "ASC"]]
			});
			let newData;
			if (reqObj.projectId && reqObj.type == "document") {
				newData = await ProjectDocuments.findAll({
					where: {
						projectId: reqObj.projectId,
						documentType: "new"
					}
				});
			}

			if (_.size(documentData) <= 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
			/*let countData = await Projects.count({
				where: cond,
				include: [
					{
						model: ProjectDocuments
					}
				]
			});*/
			documentData.count =
				documentData && documentData.rows
					? documentData.rows.length
					: 0;
			documentData.newData = newData ? newData : [];
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				data: documentData,
				message: label.LABEL_SUCCESS
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* delete document */
	const deleteDocument = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let cond = {};
			if (reqObj.projectId && reqObj.imageName) {
				let images = [];
				if (reqObj.imageName) {
					images = reqObj.imageName.split(",");
				}

				await ProjectDocuments.update(
					{ imageName: images },
					{
						where: {
							projectId: reqObj.projectId
						}
					}
				);
			}
			if (reqObj.documentId) {
				let documentIds = reqObj.documentId.split(",");
				cond["id"] = { $in: documentIds };

				if (reqObj.projectId) {
					cond["projectId"] = reqObj.projectId;
				}

				if (reqObj.type) {
					cond["documentType"] = reqObj.type;
				}
				if (reqObj.documents) {
					let documents = reqObj.documents
						? reqObj.documents.split(",")
						: [];
					await ProjectDocuments.update(
						{ documentName: documents },
						{
							where: {
								id: { $in: documentIds }
							}
						}
					);
				} else {
					await ProjectDocuments.destroy({
						where: cond
					});
				}
			}
			if (reqObj.mapId) {
				let mapIds = reqObj.mapId.split(",");
				if (reqObj.documents) {
					let documents = reqObj.documents
						? reqObj.documents.split(",")
						: [];
					await ProjectDocumentMaps.update(
						{ documentName: documents },
						{
							where: {
								id: { $in: mapIds }
							}
						}
					);
				} else {
					await ProjectDocumentMaps.destroy({
						where: { id: { $in: mapIds } }
					});
				}
			}

			if (
				!reqObj.mapId &&
				!reqObj.documentId &&
				reqObj.projectId &&
				reqObj.type
			) {
				await _deleteProjectDocument(reqObj.projectId, reqObj.type);
			}
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.DELETE_SUCCESS
			});
		} catch (err) {
			console.log(err);
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	const _deleteProjectDocument = async (projectId, type) => {
		if (type == "soi") {
			type = ["soi", "vo"];
		}
		await ProjectDocuments.findAll({
			where: {
				documentType: type,
				projectId: projectId
			},
			returning: true
		})
			.then(async response => {
				if (response && response.length > 0) {
					let doucmentIds = _.map(response, "id");
					await ProjectDocuments.destroy({
						where: {
							id: { $in: doucmentIds }
						}
					});
					await ProjectDocumentMaps.destroy({
						where: {
							documentId: { $in: doucmentIds }
						}
					});
				}
			})
			.catch(err => {
				console.log(err);
			});
		return true;
	};

	/* create / update latest / soi&vo / tds&msds / claims documents */
	const createDocument = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const documentObj = utils.getReqValues(req);
			const reqObj = documentObj.documentsData
				? JSON.parse(documentObj.documentsData)
				: [];
			console.log(reqObj, "reqObj=========");
			if (reqObj && reqObj.length > 0) {
				let documentFiles =
					req.files && req.files.documents
						? req.files.documents
						: documentObj.documents
						? JSON.parse(documentObj.documents)
						: [];
				let documentArray = reqObj;
				if (
					_.some(documentArray, {
						actionType: "single"
					})
				) {
					if (documentArray) {
						for (let i = 0; i < documentArray.length; i++) {
							if (
								documentArray[i] &&
								documentArray[i].actionType === "single"
							) {
								await _createOtherDocument(
									documentArray[i],
									documentFiles
								);
							}
						}
					}
				} else {
					console.log(documentArray, "documentArray=========");
					documentArray = _.groupBy(documentArray, "name");
					let documentKeys = _.keys(documentArray);

					for (let i = 0; i < documentKeys.length; i++) {
						await _createMultipleDocument(
							documentArray[documentKeys[i]],
							documentFiles,
							"other"
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

	/* create / update other documents */
	const _createOtherDocument = async (documentArray, documentFiles) => {
		let projectId = documentArray.projectId;
		let documentId = documentArray.documentId
			? documentArray.documentId
			: null;
		let type = documentArray.type;
		let fileName = documentArray.fileName;
		// let otherArray = [];
		if (fileName && documentFiles && documentFiles.length > 0) {
			fileName.forEach(async value => {
				let fileValues = _.filter(documentFiles, [
					"originalname",
					value
				]);
				// if (fileValues && fileValues.length > 0) {
				// 	otherArray.push(fileValues[0].filename);
				// }
				await utils.generateFilePath(projectId, type, fileValues);
			});
		}

		let documentObj = {
			projectId: projectId,
			documentType: type,
			name: documentArray.fieldName ? documentArray.fieldName : null,
			documentName: fileName,
			remarks: documentArray.remarks ? documentArray.remarks : null,
			fileName: [],
			path: "project-documents/" + projectId + "/" + type + "/"
		};
		if (projectId && documentId) {
			await ProjectDocuments.destroy({
				where: {
					id: documentId,
					projectId: projectId
				}
			});
		}
		await ProjectDocuments.create(documentObj);
		if (projectId) {
			await notification.create(projectId, type);
		}
		// await utils.generateFilePath(projectId, type, fileValues);
		return true;
	};

	/* download a document file */
	const downloadFile = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			let docPath, mapPath;
			if (reqObj.documentId) {
				docPath = await ProjectDocuments.findOne({
					where: { id: reqObj.documentId },
					returning: true
				});
			}
			if (reqObj.mapId) {
				mapPath = await ProjectDocumentMaps.findOne({
					where: { id: reqObj.mapId },
					returning: true
				});
			}
			let filePath =
				docPath && docPath.path
					? docPath.path
					: mapPath && mapPath.path
					? mapPath.path
					: null;
			let fileName =
				docPath && docPath.documentName
					? docPath.documentName
					: mapPath && mapPath.documentName
					? mapPath.documentName
					: null;
			if (filePath && fileName) {
				console.log("testtttt");
				const archive = archiver("zip");

				archive.on("error", function(err) {
					res.status(500).send({ error: err.message });
				});

				//on stream closed we can end the request
				archive.on("end", function() {
					console.log("Archive wrote %d bytes", archive.pointer());
				});

				//set the archive name
				res.attachment("documents.zip");

				//this is the streaming magic
				archive.pipe(res);

				for (let i in fileName) {
					// const path =
					// 	config.uploadPath +
					// 	"server/uploads/" +
					// 	filePath +
					// 	fileName[i];
					// console.log(path, "path==============");
					archive.append(fileName[i], { name: `${fileName[i]}` });
				}

				archive.finalize();

				// res.writeHead(200, {
				// 	"Content-disposition": "attachment; filename=documents.zip"
				// }); //here you can add more headers
				// var files;
				// fileName.forEach(docValue => {
				// 	const path =
				// 		config.uploadPath +
				// 		"server/uploads/" +
				// 		filePath +
				// 		"/" +
				// 		docValue +
				// 		"";
				// 	files = fs.createReadStream(path);
				// });
				// files.pipe(res);
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

	/* mobile upload document / images files */
	const uploadFile = async (req, res) => {
		try {
			const reqObj = utils.getReqValues(req);
			// console.log(reqObj, "reqObj==============");
			if (reqObj.fileName == "") {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: "fileName is required"
				});
			}

			if (reqObj.documents) {
				let base64Image = reqObj.documents.split(";base64,").pop();
				let imageBuffer = base64Image;
				let dir_name = config.uploadPath + "server/uploads/";
				if (!fs.existsSync(dir_name)) {
					fs.mkdirSync(dir_name, {
						recursive: true
					});
				}
				fs.writeFileSync(dir_name + reqObj.fileName, imageBuffer, {
					encoding: "base64"
				});
				let dataObj = {
					originalname: reqObj.fileName,
					filename: reqObj.fileName,
					destination: dir_name,
					path: dir_name + reqObj.fileName
				};
				console.log(dataObj, "dataObj============");
				return res.status(httpStatus.OK).json({
					status: httpStatus.OK,
					message: label.SUCCESS,
					data: dataObj
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

	return {
		create,
		getDocuments,
		deleteDocument,
		createDocument,
		downloadFile,
		uploadFile
	};
};
export default DocumentController();
