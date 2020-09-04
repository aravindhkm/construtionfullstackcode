import { validationResult } from "express-validator";
import httpStatus from "http-status";
import _ from "lodash";
import db from "../../config/sequelize";
import utils from "../services/utils.service";
import label from "../../config/resources";
const { ProjectCategories, Actions } = db;

const MasterController = () => {
	/* get action / category */
	const getMasters = async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				throw errors.array();
			}
			const reqObj = utils.getReqValues(req);

			let cond = {};

			cond["isDeleted"] = 0;
			let modelName;
			if (reqObj.type == "category") {
				modelName = ProjectCategories;
			} else {
				modelName = Actions;
			}
			let masterData = await modelName.findAll({
				where: cond,
				attributes: { exclude: ["createdAt", "updatedAt"] },
				order: [["id", "ASC"]]
			});
			if (_.size(masterData) <= 0) {
				return res.status(httpStatus.BAD_REQUEST).json({
					status: httpStatus.BAD_REQUEST,
					message: label.SOMETHING_WRONG
				});
			}

			return res.status(httpStatus.OK).json({
				status: httpStatus.OK,
				message: label.LABEL_SUCCESS,
				data: masterData
			});
		} catch (err) {
			if (!err.statusCode) {
				err.statusCode = httpStatus.BAD_REQUEST;
			}
			return res.status(err.statusCode).json(err);
		}
	};

	return {
		getMasters
	};
};
export default MasterController();
