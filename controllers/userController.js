const mongoose= require('mongoose');
const User= mongoose.model('User');
const Story= mongoose.model('Story');
const promisify= require('es6-promisify');
var markdown = require( "markdown" ).markdown;

exports.loginForm = (req,res)=>{
    res.render('login', {title: 'Login'});
}

exports.registerForm  = (req,res)=>{
    res.render('register', {title: 'Register'});
}

exports.validateRegister = (req,res,next) =>{
     req.sanitizeBody('name');
     req.checkBody('name', 'You must give an username!').notEmpty();
     req.checkBody('email','That email is not valid!').isEmail();
     req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress:false
     });
     req.checkBody('password', 'Password can\'t be blank!').notEmpty();
     req.checkBody('password-confirm', 'Confirmed Password can\'t be blank!').notEmpty();
     req.checkBody('password-confirm', 'Oops! The passwords don\'t match!').equals(req.body.password);

     const errors= req.validationErrors();
     if(errors){
         req.flash('error', errors.map(err=>err.msg));
         res.render('register', {title: 'Register', body: req.body, flashes: req.flash()})
         return;
     }
     next();
}

exports.register = async(req,res,next) =>{
    const user= new User({email: req.body.email, name: req.body.name});
    const register= promisify(User.register, User);
    await register(user, req.body.password);
    // res.send('It works!');
    next();//pass to Auth controller 
};

exports.account = (req,res)=>{
    res.render('account', {title: 'Edit your accoount'});
};

exports.updateAccount = async (req,res)=>{
    const updates={
        name: req.body.name,
        email: req.user.email,
        about: req.body.about
    }
    const user = await User.findOneAndUpdate(
        {_id: req.user._id},
        {$set: updates},
        {new: true, runValidators:true, context:'query'}
    );
    req.flash('success', 'Profile Updated!');
    res.redirect(`/profile/${user.slug}`);
};

exports.blog =(req,res)=>{
    res.render('blog', {Title:'Test Blog'});
};

exports.blogPost = (req,res)=>{
    console.log(req.body.blog);
    const blog_html= markdown.toHTML(req.body.blog);
    res.render('blogPost', {blog_html});
};

exports.profile = async (req,res)=>{
    const users = await User.find({
        slug: req.params.id
    });
    const userThis = users[0];
    const stories= await Story.find({
        author: userThis._id
    }).populate('author');
    res.render('profilepage', {title: `${userThis.name}`, userThis, stories});
};

exports.followUser = async (req,res)=>{
    const followers = req.user.followers.map((obj)=>obj.toString());
    const operator = followers.includes(req.params.id) ? '$pull' : '$addToSet';
    const followedUser= await User.findById(req.params.id);
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {[operator]: {followers : followedUser._id}},
        {new : true}
    );
    res.json(user);
};

exports.getFollowers = async (req,res)=>{
    const users = await User.find({
        slug: req.params.id
    }).populate('followers');
    const user = users[0];
    // console.log(user[0]);
    res.render('following', {title: 'Following', user});

}