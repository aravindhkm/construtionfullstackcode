module.exports = (sequelize, DataTypes) => {
	const ProjectDocumentMaps = sequelize.define(
		"ProjectDocumentMaps",
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
			documentId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			documentName: {
				type: DataTypes.JSONB,
				defaultValue: [],
				allowNull: true
			},
			documentType: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			fileName: {
				type: DataTypes.JSONB,
				defaultValue: [],
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
			tableName: "ProjectDocumentMaps",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectDocumentMaps.associate = models => {};

	return ProjectDocumentMaps;
};
