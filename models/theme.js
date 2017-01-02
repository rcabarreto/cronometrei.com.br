/**
 * Created by barreto on 28/12/16.
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define('theme', {
        theme_name: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        image_name: {
            type: DataTypes.STRING(512),
            allowNull: false
        },
        logo_color: {
            type: DataTypes.STRING(15),
            allowNull: false,
            defaultValue: "#FFF"
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
};