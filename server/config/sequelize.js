import path from "path";
import fs from "fs";
import Sequelize from "sequelize";
import _ from "lodash";
import config from "./config";
import utils from "../src/services/utils.service";

console.log("configconfigconfig", config);

const db = {};
const Op = Sequelize.Op;
const operatorsAliases = {
	$eq: Op.eq,
	$ne: Op.ne,
	$gte: Op.gte,
	$gt: Op.gt,
	$lte: Op.lte,
	$lt: Op.lt,
	$not: Op.not,
	$in: Op.in,
	$notIn: Op.notIn,
	$is: Op.is,
	$like: Op.like,
	$notLike: Op.notLike,
	$iLike: Op.iLike,
	$notILike: Op.notILike,
	$regexp: Op.regexp,
	$notRegexp: Op.notRegexp,
	$iRegexp: Op.iRegexp,
	$notIRegexp: Op.notIRegexp,
	$between: Op.between,
	$notBetween: Op.notBetween,
	$overlap: Op.overlap,
	$contains: Op.contains,
	$contained: Op.contained,
	$adjacent: Op.adjacent,
	$strictLeft: Op.strictLeft,
	$strictRight: Op.strictRight,
	$noExtendRight: Op.noExtendRight,
	$noExtendLeft: Op.noExtendLeft,
	$and: Op.and,
	$or: Op.or,
	$any: Op.any,
	$all: Op.all,
	$values: Op.values,
	$col: Op.col
};

// connect to postgres db
const sequelize = new Sequelize(
	config.postgres.db,
	config.postgres.user,
	config.postgres.password,
	{
		operatorsAliases,
		dialect: "postgres",
		port: config.postgres.port,
		host: config.postgres.host
	}
);

const modelsDir = path.normalize(`${__dirname}/../src/models`);

// loop through all files in models directory ignoring hidden files and this file
fs.readdirSync(modelsDir)
	.filter(file => file.indexOf(".") !== 0 && file.indexOf(".map") === -1)
	// import model files and save model names
	.forEach(file => {
		console.info(`Loading model file ${file}`);
		const model = sequelize.import(path.join(modelsDir, file));
		db[model.name] = model;
	});

// calling all the associate function, in order to make the association between the models
Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

// Synchronizing any model changes with database.
sequelize
	.sync({
		// alter: true
		// force: true
	})
	.then(
		function() {
			console.log("DB Synced!");
			utils.initialUserRecords();
		},
		function(err) {
			console.log("DB Sync error : ", err);
		}
	);

// assign the sequelize variables to the db object and returning the db.
module.exports = _.extend(
	{
		sequelize,
		Sequelize
	},
	db
);
