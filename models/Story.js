const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storySchema = new mongoose.Schema({
	name : {
		type: String,
		trim: true,
		required: 'Please name your story!'
	},
	slug: String,
	tags: {
		type: [String],
		trim: true
	},
	created : {
		type: Date,
		default: Date.now
	},
	content: {
		type: String,
		required: 'Are you sure you wrote your story?'
	},
	photo: String,
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply an author'
	}

});

storySchema.index({
	name: 'text',
	content:'text'
});

storySchema.pre('save', async function(next){
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

storySchema.statics.getTagsList = function (){
	return this.aggregate([
		{$unwind: '$tags'},
		{ $group: {_id: '$tags', count: {$sum:1}}},
		{$sort: { count: -1}}

	])

};


module.exports = mongoose.model('Story',storySchema);

