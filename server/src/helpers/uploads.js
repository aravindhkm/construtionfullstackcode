import config from "../../config/config";

const fs = require("fs-extra");
const _ = require("lodash");

class UploadHelper {
	constructor(files, id) {
		this.files = files;
		this.id = id;

		this.errImgs = {};
		this.successImgs = {};
	}


	async moveFile(from, to, file_name, fieldname) {
		try {

			// throw "jahir";

			await fs.move(from, to);

			if (!this.successImgs[fieldname]) {
				this.successImgs[fieldname] = [];
			}

			this.successImgs[fieldname].push(file_name);
			console.log("success!");
		} catch (err) {
			fs.pathExists(from, (err, exists) => {
				if (exists) {
					fs.remove(from, err => {
						if (err) {
							return console.error(err);
						}

						console.log(file_name, " ----> remove success!");
					});
				}
			});

			if (!this.errImgs[fieldname]) {
				this.errImgs[fieldname] = [];
			}

			this.errImgs[fieldname].push(file_name);
		}
	}

	getFolderPath() {
		const { id } = this;

		return `${id % 100}/${id % 1000}`;
	}

	saveImageRecord(user_type, imgId) {
		const { files, id } = this;
		const folder_path = this.getFolderPath();

		this.errImgs = {};
		this.successImgs = {};
		const base_path = `${config.UPLOAD_PATH}/${user_type}/${id}/${folder_path}`;

		return new Promise(async (resolve, reject) => {
			await _.forEach(files, file => {
				let to_image;
				const base_img_path = `${base_path}/${file.fieldname}/`;

				to_image = `${base_img_path}/${file.originalname}`;

				this.moveFile(file.path, to_image, file.originalname, file.fieldname);
			});

			if (_.size(this.errImgs) == 0) {
				resolve({ status: "success", records: this.successImgs });
			} else {
				reject({ status: "error", records: this.errImgs });
			}
		});
	}

	deleteImage(user_type, imgId) {
		const { files, id } = this;
		const folder_path = this.getFolderPath();
		const base_path = `${config.UPLOAD_PATH}/${user_type}/${id}/${folder_path}`;

		_.forEach(files, file => {
			let base_img_path = `${base_path}/${file.fieldname}/`;

			if (imgId) {
				base_img_path = `${base_img_path}${imgId}/`;
			}
			fs.unlink(base_img_path + file.originalname);
		});
	}

	removeImage(path) {
		console.log("path", path);
		return new Promise(async (resolve, reject) => {
			await fs.readdir(path, (err, images) => {
				_.forEach(images, image => {
					fs.unlink(`${path}/${image}`);
				});
				resolve({ response: "success" });
			});
		});
	}

	deleteFolder(id) {
		const base_path = `${config.UPLOAD_PATH}/attachment/${id}`;

		console.log("base_path", base_path);

		// fs.remove('base_path');
	}

	getDownloadPath(user_type) {
		const folder_path = this.getFolderPath();
		const base_path = `${config.UPLOAD_PATH}/${user_type}/${this.id}/${folder_path}`;

		return base_path;
	}
}

export default UploadHelper;
