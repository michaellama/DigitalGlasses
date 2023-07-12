// authMiddleware.js

module.exports.checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports.checkNotAuthenticated = function (req, res, next) {
    console.log("Authentication Status: ", req.isAuthenticated());
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
}

