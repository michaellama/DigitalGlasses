// authMiddleware.js

module.exports.checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin');
}

module.exports.checkNotAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
}
