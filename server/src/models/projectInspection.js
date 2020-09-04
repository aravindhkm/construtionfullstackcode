module.exports = (sequelize, DataTypes) => {
	const ProjectInspections = sequelize.define(
		"ProjectInspections",
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
			name: {
				type: DataTypes.STRING(64),
				allowNull: false
			},
			imageName: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			markerImage: {
				type: DataTypes.TEXT,
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
			tableName: "ProjectInspections",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectInspections.associate = models => {
		ProjectInspections.hasMany(models.ProjectInspectionPoints, {
			foreignKey: "inspectionId",
			as: "points"
		});
		ProjectInspections.hasMany(models.ProjectInspectionPointMaps, {
			foreignKey: "inspectionId",
			as: "pointMaps"
		});
	};

	return ProjectInspections;
};
