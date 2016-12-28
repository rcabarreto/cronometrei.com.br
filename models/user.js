/**
 * Created by barreto on 28/12/16.
 */
var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        user_id: {
            type: DataTypes.STRING(32),
            allowNull: false,
            validate: {
                len: [1, 32]
            }
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: true,
            validate: {
                len: [7, 100]
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);
                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        },
        gender: {
            type: DataTypes.STRING(12),
            allowNull: true
        },
        link: {
            type: DataTypes.STRING,
            allowNull: true
        },
        locale: {
            type: DataTypes.STRING(6),
            allowNull: true
        },
        timezone: {
            type: DataTypes.STRING(5),
            allowNull: true
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                // user.email
                if(typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        }
    });
};