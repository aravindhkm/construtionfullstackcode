module.exports = (sequelize, DataTypes) => {
	const Notifications = sequelize.define(
		"Notifications",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			title: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			notificationType: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Notifications",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Notifications.associate = models => {
		Notifications.belongsTo(models.Users, { foreignKey: "userId" });
	};

	return Notifications;
};
