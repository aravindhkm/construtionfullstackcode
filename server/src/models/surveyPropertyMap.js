module.exports = (sequelize, DataTypes) => {
	const SurveyPropertyMaps = sequelize.define(
		"SurveyPropertyMaps",
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
			propertyId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING(164),
				allowNull: true
			},
			imageName: {
				type: DataTypes.JSONB,
				defaultValue: [],
				allowNull: true
			},
			imagePath: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "SurveyPropertyMaps",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	SurveyPropertyMaps.associate = models => {};

	return SurveyPropertyMaps;
};
