module.exports = (sequelize, DataTypes) => {
	const ProjectDocuments = sequelize.define(
		"ProjectDocuments",
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
			actionId: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			name: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			documentName: {
				type: DataTypes.JSONB,
				defaultValue: [],
				allowNull: true
			},
			fileName: {
				type: DataTypes.JSONB,
				defaultValue: [],
				allowNull: true
			},
			imageName: {
				type: DataTypes.JSONB,
				defaultValue: [],
				allowNull: true
			},
			path: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			documentType: {
				type: DataTypes.STRING(64),
				allowNull: true
			},
			remarks: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProjectDocuments",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectDocuments.associate = models => {
		ProjectDocuments.belongsTo(models.Actions, {
			foreignKey: "actionId"
		});
		ProjectDocuments.hasMany(models.ProjectDocumentMaps, {
			foreignKey: "documentId"
		});
	};

	return ProjectDocuments;
};
