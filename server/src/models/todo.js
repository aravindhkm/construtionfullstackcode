module.exports = (sequelize, DataTypes) => {
	const ToDos = sequelize.define(
		"ToDos",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			title: {
				type: DataTypes.STRING(128),
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			userId: {
				type: DataTypes.JSONB,
				defaultValue: [],
				allowNull: true
			},
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			date: {
				type: DataTypes.DATEONLY,
				allowNull: true
			},
			time: {
				type: DataTypes.TIME,
				allowNull: true
			},
			createdBy: {
				type: DataTypes.INTEGER,
				allowNull: true
			},
			status: {
				type: DataTypes.ENUM,
				values: ["completed", "pending"],
				defaultValue: "pending"
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ToDos",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ToDos.associate = models => {
		ToDos.belongsTo(models.Projects, { foreignKey: "projectId" });
	};

	return ToDos;
};
