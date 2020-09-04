module.exports = (sequelize, DataTypes) => {
	const ProjectMonitorValueMaps = sequelize.define(
		"ProjectMonitorValueMaps",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			monitorId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			projectId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			monitorValueId: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING(128),
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
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "ProjectMonitorValueMaps",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	ProjectMonitorValueMaps.associate = function(models) {};

	return ProjectMonitorValueMaps;
};
