/**
 * Created by barreto on 28/12/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};