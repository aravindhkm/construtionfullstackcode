module.exports = (sequelize, DataTypes) => {
	const Settings = sequelize.define(
		"Settings",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			name: {
				type: DataTypes.TEXT,
				unique: true,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			status: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Settings",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Settings.associate = models => {};

	return Settings;
};
