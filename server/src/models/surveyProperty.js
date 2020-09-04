module.exports = (sequelize, DataTypes) => {
	const SurveyProperties = sequelize.define(
		"SurveyProperties",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			surveyId: {
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
			tableName: "SurveyProperties",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	SurveyProperties.associate = models => {
		SurveyProperties.hasMany(models.SurveyPropertyMaps, {
			foreignKey: "propertyId"
		});
	};

	return SurveyProperties;
};
