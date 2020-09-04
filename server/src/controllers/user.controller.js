import { validationResult, check } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import utils from "../services/utils.service";
import label from "../../config/resources";
import db from "../../config/sequelize";
const { Users, UserProjectMaps } = db;
const Op = db.Sequelize.Op;

const UserController = () => {
	/* create / update user */
	const create = async (req, res) => {
		try {
			const userObj = utils.getReqValues(req);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}

			const reqObj = JSON.parse(userObj.userData);
			let userData = [];
			let emailCond = {};
			let nameCond = {};
			let whereCodn = {};
			if (reqObj.email) {
				emailCond["email"] = reqObj.email;
			}
			if (reqObj.userName) {
				nameCond["userName"] = reqObj.userName;
			}

			// whereCodn["role"] = reqObj.role;
			whereCodn["isDeleted"] = 0;
			let cond = { $or: [emailCond, nameCond], $and: whereCodn };
			userData = await Users.findOne({
				where: cond,
				attributes: {
					exclude: ["createdAt", "updatedAt", "password"]
				}
			});
			if (_.size(userData) > 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.USER_ALREADY_EXISTS
				});
			}

			if (req.files && req.files.images) {
				let imageDatas = _.map(req.files.images, "filename");
				reqObj.imageName =
					imageDatas && imageDatas[0] ? imageDatas[0] : null;
			}

			if (reqObj.userId) {
				await Users.update(reqObj, {
					where: { id: reqObj["userId"] }
				});
			} else {
				userData = await Users.create(reqObj);
			}

			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
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

	/* gets users */
	const getUsers = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			let attributes = {
				exclude: ["createdAt", "updatedAt", "password"]
			};
			if (reqObj.type == "export") {
				attributes = [
					"firstName",
					"companyName",
					"userName",
					"email",
					"imageName",
					"mobile",
					"status",
					"address"
				];
			}

			cond["isDeleted"] = 0;
			if (reqObj.userId) {
				cond["id"] = reqObj.userId;
				attributes = "";
			}
			if (reqObj.role) {
				cond["role"] = reqObj.role;
			}
			if (reqObj["searchTxt"]) {
				cond[Op.or] = [
					{
						firstName: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						email: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						userName: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					},
					{
						mobile: {
							[Op.iLike]: "%" + reqObj["searchTxt"] + "%"
						}
					}
				];
			}
			const page = reqObj.page ? reqObj.page : 1;
			const itemsPerPage = reqObj.itemsPerPage ? reqObj.itemsPerPage : 10;
			const offset = (page - 1) * itemsPerPage;

			let userData = await Users.findAndCountAll({
				where: cond,
				offset: offset,
				limit: itemsPerPage,
				attributes: attributes,
				order: [["id", "DESC"]]
			});

			if (_.size(userData) <= 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}

			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				data: userData,
				message: label.LABEL_SUCCESS
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* update user status */
	const updateStatus = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.userId) {
				reqObj.status =
					reqObj.status && reqObj.status == "true" ? true : false;
				await Users.update(
					{ status: reqObj.status },
					{
						where: { id: reqObj.userId },
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

	/* delete user */
	const deleteUser = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.userId) {
				let updateObj = { isDeleted: 1, updatedAt: new Date() };
				// await Users.update(updateObj, {
				// 	where: { id: reqObj.userId }
				// });
				await Users.destroy({
					where: { id: reqObj.userId }
				});
				await UserProjectMaps.update(updateObj, {
					where: { userId: reqObj.userId }
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

	/* list users */
	const listUsers = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};
			cond["isDeleted"] = 0;
			cond["role"] = ["contractor", "staff"];
			if (reqObj.type == "staff") {
				cond["role"] = "staff";
			}
			if (reqObj.type == "contractor") {
				cond["role"] = "contractor";
			}
			if (reqObj.type == "manager") {
				cond["role"] = "manager";
			}
			let includeModel = "";
			if (reqObj.projectId) {
				includeModel = [
					{
						model: UserProjectMaps,
						where: { projectId: reqObj.projectId }
					}
				];
			}

			let userData = await Users.findAll({
				where: cond,
				include: includeModel,
				attributes: ["id", "firstName", "lastName", "userName", "role"]
			});
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: userData
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
		getUsers,
		updateStatus,
		deleteUser,
		listUsers
	};
};

export default UserController();
