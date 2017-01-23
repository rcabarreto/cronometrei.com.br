/**
 * Created by barreto on 23/01/17.
 */

var User = function () {

    this.isLogged = false;
    this.authToken = "";
    this.id = "";
    this.user_id = "";
    this.email = "";
    this.first_name = "";
    this.last_name = "";
    this.gender = "";
    this.link = "";
    this.locale = "";
    this.name = "";
    this.timezone = 0;
    this.updated_time = "";
    this.verified = false;
    this.themeId = 1;

    this.login = function () {};
    this.logout = function () {};

    this.load = function () {};
    this.update = function () {};

    return this;
};
