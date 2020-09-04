import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import utils from "../services/utils.service";
import label from "../../config/resources";
import db from "../../config/sequelize";
import notification from "../services/notification.service";
const { Users, Projects, UserProjectMaps } = db;
const Op = db.Sequelize.Op;

const ProjectController = () => {
	/* create / update project */
	const create = async (req, res) => {
		try {
			const projectObj = utils.getReqValues(req);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = JSON.parse(projectObj.projectData);

			if (req.files && req.files.images) {
				let imageDatas = _.map(req.files.images, "filename");
				if (reqObj.imageName) {
					imageDatas = _.concat(imageDatas, reqObj.imageName);
				}
				reqObj.imageName =
					imageDatas && imageDatas.length > 0 ? imageDatas : [];
			}
			let projectData = [];
			if (reqObj.projectId) {
				await Projects.update(reqObj, {
					where: { id: reqObj["projectId"] },
					returning: true,
					raw: true,
					plain: true
				})
					.then(async updatedData => {
						if (_.size(updatedData) > 0 && reqObj.userIds) {
							updatedData = updatedData.filter(value => {
								return value != undefined;
							});
							projectData = updatedData;
							await UserProjectMaps.destroy({
								where: { projectId: reqObj.projectId }
							});
							await assignProjects(
								reqObj.projectId,
								reqObj.userIds
							);
						}
					})
					.catch(err => {
						return res.status(httpStatus.BAD_REQUEST).json(err);
					});
			} else {
				await Projects.create(reqObj)
					.then(async createdData => {
						if (_.size(createdData) > 0 && reqObj.userIds) {
							projectData = createdData;
							let projetcId = createdData.id;
							await assignProjects(projetcId, reqObj.userIds);
						}
					})
					.catch(err => {
						return res.status(httpStatus.BAD_REQUEST).json(err);
					});
			}

			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: projectData
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* get projects */
	const getProjects = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let userCond = {};

			cond["isDeleted"] = 0;
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
			let requireCond = false;
			if (reqObj.userId) {
				userCond["userId"] = reqObj.userId;
				requireCond = true;
			}

			let attributes = { exclude: ["createdAt", "updatedAt"] };
			const page = reqObj.page ? reqObj.page : 1;
			const itemsPerPage = reqObj.itemsPerPage ? reqObj.itemsPerPage : 10;
			const offset = (page - 1) * itemsPerPage;

			let projectData = await Projects.findAndCountAll({
				where: cond,
				attributes: attributes,
				include: [
					{
						model: UserProjectMaps,
						attributes: attributes,
						where: userCond,
						required: requireCond,
						include: [
							{
								model: Users,
								attributes: ["id", "userName", "role"]
							}
						]
					}
				],
				offset: offset,
				limit: itemsPerPage,
				order: [["id", "DESC"]]
			});

			if (_.size(projectData) <= 0) {
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
			projectData.count = countData;
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: projectData
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* delete project */
	const deleteProject = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let updateObj = { isDeleted: 1, updatedAt: new Date() };
			await Projects.update(updateObj, {
				where: { id: reqObj.projectId }
			});
			await UserProjectMaps.destroy({
				where: { projectId: reqObj.projectId }
			});

			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.DELETE_SUCCESS
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* assign project to user */
	const assignProjects = async (projectId, userIds) => {
		let userProjectData = [];
		if (userIds.length > 0 && projectId) {
			userIds.forEach(value => {
				let obj = {};
				obj = {
					userId: value,
					projectId: projectId
				};
				userProjectData.push(obj);
			});
			await UserProjectMaps.bulkCreate(userProjectData);
			await notification.create(projectId, "assignProject", userIds);
		}
		return true;
	};

	/* get list of projects */
	const listProjects = async (req, res) => {
		try {
			let projectData = await Projects.findAll({
				where: { isDeleted: 0 },
				attributes: ["id", "title", "description"]
			});
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: projectData
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	return {
		create,
		getProjects,
		deleteProject,
		listProjects
	};
};
export default ProjectController();
