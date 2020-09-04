import _ from "lodash";
import db from "../../config/sequelize";
const Op = db.Sequelize.Op;
const { Notifications, UserProjectMaps, Users } = db;

const notificationService = () => {
	//userId, title, description and notificationType
	//important
	// 1. Project Assigned to Staff and Contractor.
	// 2. To-Do Assigned to Staff and Contractor.
	// 3. Issue reported on particular project.

	// General:
	// 1. New File upload in project documentation/TDS & MSDS/Claims/SOI & VO.
	// 2. Image upload in Inspection/work monitoring.
	// 3. Rectification of Issue/Inspection Report
	const create = async (projectId, type, userIds) => {
		let notifyObj = {};
		if (type == "assignProject") {
			notifyObj.title = "Notification: Project Assigned";
			notifyObj.description = "Project assigned to you";
			notifyObj.notificationType = "important";
		}
		if (type == "assignToDo") {
			notifyObj.title = "Notification: ToDo Assigned";
			notifyObj.description = "ToDo Task assigned to you";
			notifyObj.notificationType = "important";
		}
		if (type == "createIssue") {
			notifyObj.title = "Notification: Issue Created";
			notifyObj.description = "Issues Created";
			notifyObj.notificationType = "important";
			userIds = await getUsers(projectId);
		}
		if (
			type == "rectifyIssue" ||
			type == "inspectionDefect" ||
			type == "inspectionRectify" ||
			type == "monitor" ||
			type == "document" ||
			type == "claims" ||
			type == "soi" ||
			type == "tds"
		) {
			if (type == "rectifyIssue") {
				notifyObj.title = "Notification: Issue Rectified";
				notifyObj.description = "Issues Rectified";
			} else if (type == "inspectionDefect") {
				notifyObj.title = "Notification: Added Inspection Defects";
				notifyObj.description = "Defect image was uploaded";
			} else if (type == "monitor") {
				notifyObj.title = "Notification: Work Monitor Image Upload";
				notifyObj.description = "Uploaded image in work monitor report";
			} else if (type == "document") {
				notifyObj.title = "Notification: Project Documents";
				notifyObj.description = "Project Documents Was Uploaded";
			} else if (type == "claims") {
				notifyObj.title = "Notification: Claims Documents";
				notifyObj.description = "Claims Documents Was Uploaded";
			} else if (type == "soi") {
				notifyObj.title = "Notification: SOI & VO Documents";
				notifyObj.description = "SOI & VO Documents Was Uploaded";
			} else if (type == "tds") {
				notifyObj.title = "Notification: TDS/MSDS Documents";
				notifyObj.description = "TDS/MSDS Documents Was Uploaded";
			} else {
				notifyObj.title = "Notification: Inspection Rectified";
				notifyObj.description = "Rectify image was uploaded";
			}

			notifyObj.notificationType = "general";
			userIds = await getUsers(projectId);
		}

		if (userIds && userIds.length > 0) {
			userIds.forEach(async value => {
				notifyObj.userId = value;
				console.log(notifyObj, "notifyObj============");
				await Notifications.create(notifyObj);
			});
		}
		return true;
	};

	const getUsers = async projectId => {
		let userIds = await UserProjectMaps.findAll({
			where: { projectId: projectId, isDeleted: 0 },
			include: [{ model: Users }]
		});

		userIds = _.map(userIds, "userId");
		console.log(userIds, "userIds============");
		return userIds;
	};
	return {
		create,
		getUsers
	};
};
export default notificationService();
