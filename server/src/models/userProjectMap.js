module.exports = (sequelize, DataTypes) => {
	const UserProjectMaps = sequelize.define(
		"UserProjectMaps",
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
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			status: {
				type: DataTypes.ENUM,
				values: ["assigned", "unassigned"],
				defaultValue: "assigned",
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "UserProjectMaps",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	UserProjectMaps.associate = models => {
		// UserProjectMaps.belongsTo(models.Projects, { foreignKey: "projectId" });
		UserProjectMaps.belongsTo(models.Users, { foreignKey: "userId" });
	};

	return UserProjectMaps;
};
