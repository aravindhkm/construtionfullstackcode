module.exports = (sequelize, DataTypes) => {
	const ProjectCategories = sequelize.define(
		"ProjectCategories",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			name: {
				type: DataTypes.STRING(128),
				unique: true,
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			routeName: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProjectCategories",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectCategories.associate = models => {};

	return ProjectCategories;
};
