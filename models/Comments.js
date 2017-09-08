var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema ({
  body: String,
  author: String,
  score:Number,
  upvotes: {type: Number, default: 0},
  time: String,
  record: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' }
});

CommentSchema.methods.upvote = function (cb) {
  this.upvotes++;
  this.save(cb);
}

mongoose.model('Comment', CommentSchema);