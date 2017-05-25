/**
 * Created by barreto on 28/12/16.
 */
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

// if(env === 'production'){
//     sequelize = new Sequelize(process.env.DATABASE_URL, {
//         dialect: 'postgres'
//     });
// }else{
sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-cronometrei-api.sqlite'
});
// }

var db = {};

db.user     = sequelize.import(__dirname + '/models/user.js');
db.timer    = sequelize.import(__dirname + '/models/timer.js');
db.feedback = sequelize.import(__dirname + '/models/feedback.js');
db.theme    = sequelize.import(__dirname + '/models/theme.js');
db.token    = sequelize.import(__dirname + '/models/token.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.timer.belongsTo(db.user);
db.user.hasMany(db.timer);

module.exports = db;