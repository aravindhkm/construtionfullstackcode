module.exports = (sequelize, DataTypes) => {
	const Projects = sequelize.define(
		"Projects",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			title: {
				type: DataTypes.STRING(128),
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false
			},
			location: {
				type: DataTypes.JSONB(),
				allowNull: true
			},
			address: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			imageName: {
				type: DataTypes.JSONB,
				defaultValue: [],
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Projects",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Projects.associate = models => {
		Projects.hasMany(models.UserProjectMaps, { foreignKey: "projectId" });
		Projects.hasMany(models.ProjectDocuments, { foreignKey: "projectId" });
		Projects.hasMany(models.ProjectDocumentMaps, {
			foreignKey: "projectId"
		});
		Projects.hasMany(models.ProjectInspections, {
			foreignKey: "projectId",
			as: "inspections"
		});
		Projects.hasMany(models.ProjectInspectionPoints, {
			foreignKey: "projectId",
			as: "points"
		});
		Projects.hasMany(models.ProjectInspectionPointMaps, {
			foreignKey: "projectId",
			as: "pointMaps"
		});
		Projects.hasMany(models.ProjectMonitors, {
			foreignKey: "projectId",
			as: "monitors"
		});
		Projects.hasMany(models.ProjectMonitorValues, {
			foreignKey: "projectId",
			as: "monitorValue"
		});
		Projects.hasMany(models.ProjectMonitorValueMaps, {
			foreignKey: "projectId",
			as: "mapValue"
		});
		Projects.hasMany(models.ProjectIssues, {
			foreignKey: "projectId"
		});
		Projects.hasMany(models.ProjectSurveys, {
			foreignKey: "projectId"
		});
		Projects.hasMany(models.ToDos, {
			foreignKey: "projectId"
		});
	};

	return Projects;
};
