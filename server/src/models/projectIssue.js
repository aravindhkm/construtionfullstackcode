module.exports = (sequelize, DataTypes) => {
	const ProjectIssues = sequelize.define(
		"ProjectIssues",
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
			tableName: "ProjectIssues",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectIssues.associate = models => {};

	return ProjectIssues;
};
