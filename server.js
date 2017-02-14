// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// Create a mongoose DB Server
var mongoose = require('mongoose');
// Connect Mongoose to MongoDB
mongoose.connect('mongodb://localhost/message_db');
// Require body-parser (to receive post data from clients)
var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 2},
    text: {type: String, required: true, min: 2},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true})

var CommentSchema = new mongoose.Schema({
    _post: {type: Schema.Types.ObjectId, ref: 'Post'},
    name: {type: String, required: true, minlength: 2},
    text: {type: String, required: true, min: 2},
}, {timestamps: true})
// We are setting this Schema in our Models as 'Mongoose'
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
// We are retrieving this Schema from our Models, named 'Mongoose'
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
// Use native promises
mongoose.Promise = global.Promise;

var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

app.get('/', function(req, res) {

    Post.find({})
    .populate('comments')
    .exec(function (err, post_list) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {post_list: post_list})
        }
    })
})

app.post('/post_message', function (req, res) {
    console.log("POST DATA", req.body);
    // This is where we would add the user from req.body to the database.
    var post_message = new Post({name: req.body.name, text: req.body.message});

    post_message.save(function(err) {
        if (err) {
            console.log("Something Wrong");
        } else {
            console.log('Successfully Added a Post!');
            res.redirect('/');
        }
    })
})

app.post('/post_comment/:id', function (req, res) {
    console.log("POST DATA", req.body);
    // This is where we would add the user from req.body to the database.
    Post.findOne({_id: req.params.id}, function (err, post) {
        var comment = new Comment({_post: post._id, name: req.body.name, text: req.body.comment});
        comment.save(function (err) {
            post.comments.push(comment);
            console.log(comment);
            post.save(function (err) {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("Added Comment");
                    res.redirect('/')
                }
            })
        })
    })
})

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening for Messages on port 8000");
})
