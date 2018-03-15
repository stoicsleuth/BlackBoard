const express = require('express');
const router = express.Router();
const storyController = require ('../controllers/storyController');
const userController = require ('../controllers/userController');
const AuthController = require ('../controllers/AuthController');
const {catchErrors} = require('../handlers/errorHandlers');

router.get('/', catchErrors(storyController.showStory));

router.get('/stories', catchErrors(storyController.showStory));

router.get(`/story/:id/edit`, catchErrors(storyController.editStory));
router.get('/add', 
    AuthController.isLoggedIn,
    storyController.addStory);

router.post('/add', 
    storyController.upload,
    catchErrors(storyController.resize),
    catchErrors(storyController.createStory)
);
router.post(`/add/:id`, 
    storyController.upload,
    catchErrors(storyController.resize),
    catchErrors(storyController.updateStory));

router.post('/story/:id/delete',
    catchErrors(storyController.deleteStory)
);

router.get(`/story/:slug`, catchErrors(storyController.getStoryBySlug));

router.get('/tags', catchErrors(storyController.getStorysByTags));
router.get('/tags/:tag', catchErrors(storyController.getStorysByTags));
router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
router.get('/account', 
    AuthController.isLoggedIn,
    userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.get('/logout', AuthController.logout);
router.post('/login', AuthController.login);
router.get('/profile/:id', catchErrors(userController.profile));

router.post('/account/forgot', catchErrors(AuthController.forgot));
router.get('/account/reset/:token', catchErrors(AuthController.resetpage));
router.post('/account/reset/:token', 
    AuthController.checkPassword,
    catchErrors(AuthController.reset) 
);

router.get('/auth/google', AuthController.loginGoogle);
router.get('/auth/google/redirect', 
    AuthController.googleAuthenticate);

router.post('/register', 
    userController.validateRegister,
    userController.register,
    AuthController.login);

router.get('/blog', userController.blog);
router.post('/blog', userController.blogPost);

router.get('/hearts', 
    AuthController.isLoggedIn,
    catchErrors(storyController.getHearts
));

router.get('/profile/:id/followers',
    AuthController.isLoggedIn,
    catchErrors(userController.getFollowers)
);
router.get('/about/faq', storyController.faq);
router.get('/api/v1/search', catchErrors(storyController.searchStory));
router.post('/api/v1/stories/:id/heart', catchErrors(storyController.heartStore));
router.post('/api/v1/profile/:id/follow', catchErrors(userController.followUser));

router.get('*', function(req, res){
    res.render('404', {title: 'You shouldn\'t be here'});
});


module.exports =router;
