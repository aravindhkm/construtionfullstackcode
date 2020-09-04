module.exports = (sequelize, DataTypes) => {
	const ProjectMonitorValues = sequelize.define(
		"ProjectMonitorValues",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			monitorId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING(64),
				allowNull: false
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProjectMonitorValues",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectMonitorValues.associate = models => {
		ProjectMonitorValues.hasMany(models.ProjectMonitorValueMaps, {
			foreignKey: "monitorValueId",
			as: "mapValue"
		});
	};

	return ProjectMonitorValues;
};
