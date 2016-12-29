/**
 * Created by barreto on 28/12/16.
 */
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        user_id: {
            type: DataTypes.STRING(32),
            allowNull: false,
            validate: {
                len: [1, 32]
            }
        },
        name: {
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
            type: DataTypes.INTEGER,
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
        },
        classMethods: {
            authenticate: function(body) {

                return new Promise(function (resolve, reject) {

                    if(typeof body.email !== 'string' || typeof body.password !== 'string'){
                        return reject();
                    }

                    user.findOne({
                        where: {
                            email: body.email
                        }
                    }).then(function(user) {
                        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                            return reject();
                        }else{
                            resolve(user);
                        }
                    }, function(e){
                        reject();
                    });

                });
            },
            findByToken: function (token) {
                return new Promise(function (resolve, reject) {
                   try {
                       var decodedJWT = jwt.verify(token, 'asdfasdf');
                       var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'jpwq27z3');
                       var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                       user.findById(tokenData.id).then(function (user) {
                           if (user) {
                               resolve(user);
                           } else {
                               reject();
                           }
                       }, function (e) {
                           console.error(e);
                           reject();
                       });
                   } catch (e) {
                       // error
                       console.error(e);
                       reject();
                   }
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            },
            generateToken: function (type) {
                if (!_.isString(type)) {
                    return undefined;
                }

                try {
                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'jpwq27z3').toString();
                    var token = jwt.sign({
                        token: encryptedData
                    },'asdfasdf');

                    return token;
                } catch(e) {
                    console.error(e);
                    return undefined;
                }
            }
        }
    });

    return user;
};