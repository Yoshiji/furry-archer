/*
 * This Controller should respond to basics actions, such as:
 *      /login
 *      /logout
 *
 * 
*/


exports.index = function(req, res, next) {
    res.render('home/index');
}