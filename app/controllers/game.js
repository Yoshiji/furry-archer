/*
 * This Controller should respond to actions about the Game in general
 *
 *
 *
 *
*/


exports.index = function(req, res, next) {
    res.render('game/index');
}

exports.login = function(req, res, next) {
    res.render('game/login');
}