/**
 * Created by barreto on 28/12/16.
 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('feedback', {
        user_id: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        name: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        answer: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        message: {
            type: DataTypes.STRING(32),
            allowNull: true
        }
    });
};