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
    res.render('admin/login', {
        locals: {
            title: "Dashboard",
            description: "OnePager Dashboard",
            isAuthenticated: req.isAuthenticated()
        },
        layout: adminLayout
    });
});

/**
 * POST /login
 * Check login
 */
router.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});


/**
 * GET /dashboard
 * Dashboard Page
 */

router.get('/dashboard', checkAuthenticated, async (req, res) => {
    try {
        // Fetch the posts of the current user
        const posts = await Post.find({ userId: req.user._id });

        // Define locals object
        const locals = {
            title: "Dashboard",
            description: "OnePager Dashboard"
        };

        // Render the dashboard view
        res.render('admin/dashboard', {
            locals: {
                title: "Dashboard",
                description: "OnePager Dashboard",
                isAuthenticated: req.isAuthenticated() // make sure you're passing this
            },
            posts,
            layout: adminLayout
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
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
        locals: {
            title: "Dashboard",
            description: "OnePager Dashboard",
            isAuthenticated: req.isAuthenticated() // make sure you're passing this
        },
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
        body: req.body.body,
        userId: req.user._id
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
        locals: {
            title: "Dashboard",
            description: "OnePager Dashboard",
            isAuthenticated: req.isAuthenticated() // make sure you're passing this
        },
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
        updatedAt: Date.now(),
        userId: req.user._id
    });
    res.redirect(`/edit-post/${req.params.id}`);
});


/**
 * GET /register
 * Registration Page
 */
router.get('/register', checkNotAuthenticated, (req, res) => {
    console.log('GET /register');
    console.log('Authenticated User:', req.user);
    const locals = {
        title: "Register",
        description: "Registration Page"
    }
    res.render('admin/register', {
        locals: {
            title: "Dashboard",
            description: "OnePager Dashboard",
            isAuthenticated: req.isAuthenticated()
        },
        layout: adminLayout
    });
});

/**
 * POST /register
 * Register New User
*/
router.post('/register', async (req, res) => {

    try {
        console.log("Registration attempt");
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        console.log("Password hashed");
        const user = new User({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
        });
        console.log("User instance created");
        const existingUser = await User.findOne({ username: req.body.username });
        console.log("Checked for existing user");
        if (existingUser) {
            console.log("Username already taken");
            res.redirect('/register');
        } else {
            console.log("Username available, saving user");
            await user.save();
            console.log("User saved, logging in");

            // Log the user in
            req.login(user, function (err) {
                if (err) {
                    console.log("Error logging in after registration", err);
                    return next(err);
                }

                // Redirect to dashboard after successful login
                return res.redirect('/dashboard');
            });
        }
    } catch {
        console.log("Error during registration, redirecting to register");
        res.redirect('/register');
    }
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
