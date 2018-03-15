
const mong = require('mongoose');
const Story = mong.model('Story');
const User = mong.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
var markdown = require( "markdown" ).markdown;


const multerOptions = {
    storage: multer.memoryStorage(),
    filefilter(req, file, next) {
        const isPic = file.mimetype.startsWith('/image/');
        if(!ispic)
            next({message:'Not a supported type!'},false);
        else   next(null, true);
    }
};


exports.homepage = (req,res)=> {
    res.render('index');

};

//uploading the photo to our server storage
exports.upload = multer(multerOptions).single('photo'); //single function takes the ID of the photo input


//Resizing the photo using jimp

exports.resize = async (req,res,next)=> {
    // console.log(req.file);
    if(!req.file) {
        next();
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo= `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize( 800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`)
    next();
    

}


exports.addStory = (req,res) => {
    res.render('editStory', {title : 'Add Story'});
}

exports.createStory = async (req,res)=> {
    req.body.author = req.user._id;
    const story = await (Story(req.body)).save();
    req.flash('success', `Successfully created ${story.name}`);
    res.redirect(`/story/${story.slug}`);
}

exports.showStory = async (req,res)=> {
    const stories = await Story.find().populate('author').sort({created : -1});
    const route = 'Story';
    res.render ('stories', { title: 'Stories', stories, route, req.user.populate('hearts')});
}


const confirmOwner= (story, user) =>{
    if(!story.author.equals(user._id)){
        throw error ('You must be author of a story in order to edit');
    }
}
exports.editStory = async (req,res) => {
    const story = await Story.findOne({ _id: req.params.id});
    confirmOwner(story, req.user);
    res.render('editStory', {title:`Editing ${story.name}`, story});


}

exports.updateStory = async (req,res) => {
    
    //find and update the story
    
    const story = await Story.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true,//This will return the updated story, not the previous story by default
        runValidators: true// This will check the required fields in the form
    }).exec();
    req.flash('success', `Successfully updated <strong>${story.name}</strong> <a href="story/${story.slug}">View Story </a>`);
    res.redirect(`/stories`);

    //redirect them to show and also flash message showing it worked
};

exports.deleteStory = async (req,res) =>{
    //Checking if story is hearted by some user and removing it.
    const users = await User.find(
        {hearts: req.params.id}
    );
    for(let i=0;i<users.length;i++){
        await User.update(
            {_id: users[i]._id},
            {$pull: {hearts: req.params.id}}
        );
    };
    const story = await Story.findOneAndRemove({
        _id : req.params.id
    }).exec();
    
    req.flash('success', 'Successfully deleted your story.');
    res.redirect('/');
}

exports.getStoryBySlug = async (req,res, next)=>{
    const story= await Story.findOne({slug: req.params.slug}).populate('author');
    if(!story) {return next()};
    const blog_html= markdown.toHTML(story.content);
    res.render('story', {story,title:story.name, blog_html})
}

exports.getStorysByTags = async (req,res)=>{
    const tag= req.params.tag;
    const tagsPromise=  Story.getTagsList();
    const storyPromise=Story.find({tags:tag}).populate('author');
    const result = await Promise.all([tagsPromise,storyPromise]);
    const tags=result[0];
    const stories=result[1];
    res.render('tags', {tags,tag,title: 'Tags', stories});

};

exports.searchStory = async (req,res)=>{
    const stories = await Story.find({
        $text: {
            $search: req.query.q
        }
    }, {
        score: {$meta: 'textScore'}
    }).sort({
        score: {$meta: 'textScore'}
    });
    res.json(stories);

};

exports.heartStore = async (req,res)=>{
    const hearts = req.user.hearts.map((obj)=>obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {[operator]: {hearts : req.params.id}},
        {new : true}
    );
    res.json(user);
};

exports.getHearts = async (req,res)=>{
    const stories = await Story.find({
        _id: {$in : req.user.hearts}
    }).populate('author');
    res.render('stories', {title: 'Hearted Stories', stories});
};

exports.faq= (req,res)=>{
    res.render('faq', {title: 'Frequenty Asked Questions'});
}