const passport = require('passport');
const mongoose = require('mongoose');
const googleStrategy = require('passport-google-oauth20');

const User = mongoose.model('User');

passport.use(User.createStrategy());

passport.serializeUser((user, done)=>{
    done(null, user.id);
});

passport.deserializeUser((id, done)=>{
    User.findById(id).then((user)=>{
        done(null, user);
    })
});

passport.use(
    new googleStrategy({
        callbackURL:'/auth/google/redirect',
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_PASS
        
    }, (accessToken, refreshToken, profile,email, done)=>{
        User.findOne({googleID:email.id}).then((currentUser)=>{
            if(currentUser){
                done(null, currentUser);
            } else{
                // console.log(email);
                new User({
                    email: email.emails[0].value,
                    name: email.displayName,
                    googleID: email.id,
                    googleProfilePhoto: email.photos[0].value
                }).save().then((newUser)=>{
                    done(null, newUser);
                });
            }
        });
        
    })
);



// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


