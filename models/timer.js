/**
 * Created by barreto on 28/12/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('timer', {
        user_id: {
            type: DataTypes.STRING(32),
            allowNull: false,
            validate: {
                len: [1, 32]
            }
        },
        start: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        timer: {
            type: DataTypes.STRING(12),
            allowNull: true,
        }
    });
};