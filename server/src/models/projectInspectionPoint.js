module.exports = (sequelize, DataTypes) => {
	const ProjectInspectionPoints = sequelize.define(
		"ProjectInspectionPoints",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			inspectionId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			pointName: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			coordinates: {
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
			tableName: "ProjectInspectionPoints",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectInspectionPoints.associate = models => {
		ProjectInspectionPoints.hasMany(models.ProjectInspectionPointMaps, {
			foreignKey: "inspectionPointId",
			as: "pointMaps"
		});
	};

	return ProjectInspectionPoints;
};
