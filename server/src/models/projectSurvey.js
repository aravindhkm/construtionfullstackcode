module.exports = (sequelize, DataTypes) => {
	const ProjectSurveys = sequelize.define(
		"ProjectSurveys",
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
				type: DataTypes.STRING(128),
				allowNull: true
			},
			imageName: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			imagePath: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			markerImage: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			surveyType: {
				type: DataTypes.ENUM,
				values: ["condition", "pre-condition"],
				defaultValue: "condition"
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProjectSurveys",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectSurveys.associate = models => {
		ProjectSurveys.hasMany(models.SurveyProperties, {
			foreignKey: "surveyId"
		});
		ProjectSurveys.hasMany(models.SurveyPropertyMaps, {
			foreignKey: "surveyId"
		});
	};

	return ProjectSurveys;
};
