module.exports = (sequelize, DataTypes) => {
	const ProjectInspectionPointMaps = sequelize.define(
		"ProjectInspectionPointMaps",
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
			inspectionPointId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			defectImage: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			defectPath: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			rectifyImage: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			rectifyPath: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			replyDescription: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			verifyDate: {
				type: DataTypes.DATE,
				allowNull: true
			},
			status: {
				type: DataTypes.ENUM,
				values: ["approved", "resolved", "rejected", "pending"],
				defaultValue: "pending"
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProjectInspectionPointMaps",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectInspectionPointMaps.associate = models => {};

	return ProjectInspectionPointMaps;
};
