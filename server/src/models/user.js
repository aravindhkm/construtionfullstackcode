import bcryptService from "../services/bcrypt.service";
module.exports = (sequelize, DataTypes) => {
	const Users = sequelize.define(
		"Users",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			firstName: {
				type: DataTypes.STRING(32),
				allowNull: false
			},
			lastName: {
				type: DataTypes.STRING(32),
				allowNull: true
			},
			userName: {
				type: DataTypes.STRING(32),
				unique: true,
				allowNull: false
			},
			companyName: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			email: {
				type: DataTypes.STRING(64),
				allowNull: false,
				unique: true
			},
			password: {
				type: DataTypes.STRING(128),
				allowNull: false
			},
			imageName: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			gender: {
				type: DataTypes.ENUM,
				values: ["male", "female", "others"],
				defaultValue: null,
				allowNull: true
			},
			mobile: {
				type: DataTypes.STRING(11),
				allowNull: true
			},
			address: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			countryCode: {
				type: DataTypes.STRING(10),
				allowNull: true
			},
			location: {
				type: DataTypes.JSONB(),
				allowNull: true
			},
			role: {
				type: DataTypes.ENUM,
				values: [
					"superadmin",
					"admin",
					"staff",
					"contractor",
					"manager"
				],
				defaultValue: null,
				allowNull: true
			},
			status: {
				type: DataTypes.BOOLEAN,
				defaultValue: true
			},
			configJson: {
				type: DataTypes.JSONB,
				allowNull: true
			},
			otp: {
				type: DataTypes.STRING(10),
				allowNull: true
			},
			token: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			deviceToken: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			deviceType: {
				type: DataTypes.STRING(8),
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Users",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Users.associate = models => {
		Users.hasMany(models.UserProjectMaps, { foreignKey: "userId" });
		// Users.hasMany(models.ToDos, { foreignKey: "userId" });
		Users.hasMany(models.Notifications, { foreignKey: "userId" });
	};

	Users.beforeCreate(user => {
		if (user && user.password) {
			user.password = bcryptService().password(user.password);
		}
	});

	Users.beforeUpdate(user => {
		if (user && user.password) {
			user.password = bcryptService().password(user.password);
		}
	});

	Users.beforeBulkUpdate(user => {
		if (user.attributes && user.attributes.password) {
			user.attributes.password = bcryptService().updatePassword(
				user.attributes.password
			);
		}
	});

	return Users;
};
