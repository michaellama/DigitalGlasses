const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

/** 
 * GET /
 * HOME
*/

router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Onepager",
            description: "Build up"
        }

        let perPage = 5;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec()

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log(error);
    }
});

/** 
 * GET /
 * POST :id 
*/

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });
        const locals = {
            title: data.title,
            description: "Build up"
        }
        res.render('post', { locals, data, currentRoute: '/post/${slug}' });
    } catch (error) {
        console.log(error);
    }
});

/** 
 * POST
 * SEARCH
*/

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Build up"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') } }
            ]
        });

        res.render("search", {
            data, locals
        });
    } catch (error) {
        console.log(error);
    }
});

/** 
 * GET /:username
 * User's blog page
 */
router.get('/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Find the user
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Find the posts by this user
        const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });

        // Render the blog page
        res.render('user', {
            username: username,
            posts: posts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

/** 
 * GET /
 * ABOUT
*/

router.get('/about', (req, res) => {
    res.render('about', {
        currentRoute: '/about'
    });
});

/** 
 * GET /
 * CONTACT
*/

router.get('/contact', (req, res) => {
    res.render('contact', {
        currentRoute: '/contact'
    });
});

module.exports = router;