/**
 * Created by barreto on 28/12/16.
 */
module.exports = function (db) {

    return {
        requireAuthentication: function(req, res, next){
            var token = req.get('Auth');

            db.user.findByToken(token).then(function (user) {
                req.user = user;
                next();
            }, function () {
                res.status(401).send();
            });

        },
        logger: function(req, res, next){
            console.log(req.method +' '+ req.originalUrl);
            next();
        }
    };

};