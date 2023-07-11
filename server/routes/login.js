const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/authMiddleware');

const adminLayout = '../views/layouts/admin';

/**
 * GET /login
 * Login Page
*/
router.get('/login', checkNotAuthenticated, async (req, res) => {
    const locals = {
        title: "Admin",
        description: "OnePager Dashboard"
    }
    res.render('admin/index', { locals, layout: adminLayout });
});

/**
 * POST /login
 * Check login
*/
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

/**
 * GET /dashboard
 * Dashboard Page
*/
router.get('/dashboard', checkAuthenticated, async (req, res) => {
    const locals = {
        title: "Dashboard",
        description: "OnePager Dashboard"
    }
    const data = await Post.find();
    res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout
    });
});

/**
 * GET /add-post
 * Add New Post Page
*/
router.get('/add-post', checkAuthenticated, async (req, res) => {
    const locals = {
        title: "Add post",
        description: "OnePager Dashboard"
    }
    res.render('admin/add-post', {
        locals,
        layout: adminLayout
    });
});

/**
 * POST /add-post
 * Create New Post
*/
router.post('/add-post', checkAuthenticated, async (req, res) => {
    const newPost = new Post({
        title: req.body.title,
        body: req.body.body
    });
    await Post.create(newPost);
    res.redirect("/dashboard");
});

/**
 * GET /edit-post/:id
 * Edit Post Page
*/
router.get('/edit-post/:id', checkAuthenticated, async (req, res) => {
    const locals = {
        title: "Edit post",
        description: "OnePager Dashboard"
    }
    const data = await Post.findOne({ _id: req.params.id });
    res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
    });
});

/**
 * PUT /edit-post/:id
 * Edit Post
*/
router.put('/edit-post/:id', checkAuthenticated, async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
    });
    res.redirect(`/edit-post/${req.params.id}`);
});


/**
 * GET /register
 * Registration Page
 */
router.get('/register', checkNotAuthenticated, (req, res) => {
    const locals = {
        title: "Register",
        description: "Registration Page"
    }
    res.render('admin/register', { locals, layout: adminLayout });
});


/**
 * POST /register
 * Register New User
*/
router.post('/register', checkNotAuthenticated, async (req, res) => {
    const { username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Now save the user with the hashed password
    const newUser = new User({
        username: username,
        password: hashedPassword
    });

    newUser.save((err) => {
        if (err) {
            // Handle error
            console.log(err);
            res.redirect('/register');
        } else {
            // Redirect the user or send a response
            req.login(newUser, (err) => {
                if (err) {
                    console.log(err);
                }
                return res.redirect('/dashboard');
            });
        }
    });
});

/**
 * DELETE /delete-post/:id
 * Delete Post
*/
router.delete('/delete-post/:id', checkAuthenticated, async (req, res) => {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
});

/**
 * GET /logout
 * Logout
 */
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});


module.exports = router;
