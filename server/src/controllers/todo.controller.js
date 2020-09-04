import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import db from "../../config/sequelize";
import utils from "../services/utils.service";
import notification from "../services/notification.service";
import label from "../../config/resources";
const { ToDos, Users, Projects } = db;
const Op = db.Sequelize.Op;

const ToDoController = () => {
	/* create todo */
	const create = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.todoId) {
				await ToDos.destroy({ where: { id: reqObj.todoId } });
			}
			if (reqObj.userId && reqObj.userId.length > 0) {
				await ToDos.create(reqObj);
				await notification.create(
					reqObj.projectId,
					"assignToDo",
					reqObj.userId
				);
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

	/* get todos */
	const list = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};

			cond["isDeleted"] = 0;
			if (reqObj.todoId) {
				cond["id"] = reqObj.todoId;
			}
			if (reqObj.userId) {
				cond["userId"] = { $contains: parseInt(reqObj.userId) };
			}
			if (reqObj.dateValue) {
				cond = db.sequelize.where(
					db.sequelize.fn("date", db.sequelize.col("date")),
					"=",
					reqObj.dateValue
				);
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
			const page = reqObj.page ? reqObj.page : 1;
			const itemsPerPage = reqObj.itemsPerPage ? reqObj.itemsPerPage : 10;
			const offset = (page - 1) * itemsPerPage;
			let attributes = { exclude: ["createdAt", "updatedAt"] };
			let todoData = await ToDos.findAndCountAll({
				where: cond,
				offset: offset,
				limit: itemsPerPage,
				include: [{ model: Projects, attributes: attributes }],
				attributes: attributes,
				order: [["id", "ASC"]]
			});

			if (_.size(todoData) <= 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}
			let userData = await Users.findAll({
				where: { isDeleted: 0, status: true },
				attributes: [
					"id",
					"userName",
					"firstName",
					"lastName",
					"imageName",
					"role"
				]
			});
			todoData.userData = userData ? userData : [];
			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: todoData
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	/* delete todo */
	const deleteToDo = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.todoId) {
				let updateObj = { isDeleted: 1, updatedAt: new Date() };
				await ToDos.update(updateObj, {
					where: { id: reqObj["todoId"] },
					returning: true
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

	/* update todo status */
	const updateStatus = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);
			if (reqObj.todoId && reqObj.todoId.length > 0) {
				await ToDos.update(
					{ status: "completed" },
					{
						where: { id: { $in: reqObj["todoId"] } },
						returning: true
					}
				);
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
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	return {
		create,
		list,
		deleteToDo,
		updateStatus
	};
};
export default ToDoController();
