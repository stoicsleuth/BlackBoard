const mongoose=require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const slug = require('slugs');
const md5=require('md5');
const validator=require('validator');
const mongooseErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email :{
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: 'Please supply an email address'
    },
    name: {
        type: String,
        required: 'Please supply a name',
        trim: true
    },
    about: {
        type: String,
        trim: true 
    },
    slug: String,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    googleID: String,
    googleProfilePhoto: String,
    hearts : [
        {
            type: mongoose.Schema.ObjectId,
            ref :'Story'
        }
    ],
    followers: [
        {
            type: String
        }
    ]

});
//setup virtual fields 
userSchema.virtual('gravatar').get( function(){
    const hash= md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});
userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongooseErrorHandler);

userSchema.pre('save', async function(next){
	if(!this.isModified('name'))
	{
		next();
		return;
	}
	this.slug= slug(this.name);
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  	const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  	if(storesWithSlug.length) {
    	this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  	}	
	next();
});

module.exports = mongoose.model('User', userSchema);