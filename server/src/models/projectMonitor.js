module.exports = (sequelize, DataTypes) => {
	const ProjectMonitors = sequelize.define(
		"ProjectMonitors",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			title: {
				type: DataTypes.STRING(128),
				allowNull: false
			},
			imageName: {
				type: DataTypes.STRING(255),
				allowNull: true
			},
			path: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProjectMonitors",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectMonitors.associate = models => {
		ProjectMonitors.hasMany(models.ProjectMonitorValues, {
			foreignKey: "monitorId",
			as: "monitorValue"
		});
		ProjectMonitors.hasMany(models.ProjectMonitorValueMaps, {
			foreignKey: "monitorId",
			as: "mapValue"
		});
	};

	return ProjectMonitors;
};
