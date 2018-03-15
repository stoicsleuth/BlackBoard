const passport= require('passport');
const mongoose= require('mongoose');
const User= mongoose.model('User');
const crypto= require('crypto');
const promisify= require('es6-promisify');
const mail= require('../handlers/mail');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'Login in successfully!'
});

//logiing in using Google Strategy
exports.loginGoogle = passport.authenticate('google',{
    scope: ['email', 'profile','https://www.googleapis.com/auth/plus.login']
});

exports.googleAuthenticate = passport.authenticate('google',{
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'Login in successfully!'
});

// exports.loginRedirect = (req,res)=>{
//     req.flash('success', 'Logged-in using Google!')
//     res.redirect('/');

// };

exports.logout = (req,res) =>{
    req.logout();
    req.flash('success', 'You\'re now logged out!');
    res.redirect('./');

};

exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
        return;
    }
    
    else{
        req.flash('error', 'You must be logged in to add stories!'); 
        res.redirect('/login');
    }
};

exports.forgot = async (req,res)=>{
    const user= await User.findOne({email:req.body.email});
    if(!user){
        req.flash('error', 'No user found with given email!');
        return res.redirect('/login');
    }
    user.resetPasswordToken= crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpiry = Date.now() + 3600000; //1 hour from now
    await user.save();

    const resetUrl= `https://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    req.flash('success', `Email Sent!`);
    await mail.send({
        user,
        subject: 'Password Reset from BlackBoard',
        resetUrl,
        filename: 'password-reset'
    });
    res.redirect('/login');

};

exports.resetpage = async (req,res)=>{
    const user= await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpiry: {$gt: Date.now()}
    });
    if(!user){
        req.flash('error', 'Expired or Invalid token!');
        res.redirect("/login");
    }
    res.render('reset', {title: "Reset your password"});

};

exports.checkPassword = (req,res,next) =>{
    if(req.body.password === req.body['password-confirm'])
    {
        next();
        return;
    }
    else
    {
        request.flash('error', 'Passwords do not match');
        res.redirect('back');
    }

};

exports.reset = async (req,res) =>{
    const user= await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpiry: {$gt: Date.now()}
    });
    if(!user){
        req.flash('error', 'Expired or Invalid token!');
        res.redirect("/login");
    }
    const setPassword= promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordExpiry= undefined;
    user.resetPasswordToken=undefined;
    const updatedUser= await user.save();
    await req.login(updatedUser);
    req.flash('success', 'Password reset! You\'re now logged in');
    res.redirect('/');

};
