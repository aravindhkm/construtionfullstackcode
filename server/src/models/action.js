module.exports = (sequelize, DataTypes) => {
	const Actions = sequelize.define(
		"Actions",
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			name: {
				type: DataTypes.TEXT,
				unique: true,
				allowNull: false
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true
			},
			isMultiple: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			isDeleted: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			}
		},
		{
			tableName: "Actions",
			indexes: [
				{
					fields: ["id"]
				}
			]
		}
	);

	Actions.associate = models => {};

	return Actions;
};
