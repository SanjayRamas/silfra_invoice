var mongoose = require('mongoose');
var Record = mongoose.model('Record');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var passport = require('passport');

var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

router.get('/records', function(req, res, next) {
  Record.find(function(err, records){
    if(err){ return next(err); }

    res.json(records);
  });
});

router.post('/records', auth, function(req, res, next) {
  console.log(req.body);
  console.log(req.payload);
  var record = new Record(req.body);
  record.author = req.payload.username;

  record.save(function(err, record){
    if(err){ return next(err); }

    res.json(record);
  });
});

router.param('record', function (req, res, next, id) {
  
  var query = Record.findById(id);
  
  query.exec(function(err, record) {
        if (err) {return next(err)};
        if (!record) { return next (new Error('cant find record'));}
    
        req.record = record;
        return next();
      
  })
});

router.param('comment', function (req, res, next, id) {
  
  var query = Comment.findById(id);
  
  query.exec(function(err, comment) {
        if (err) {return next(err);};
        if (!comment) { return next (new Error('cant find comment'));}
    
        req.comment = comment;
        return next();
      
  })
});


router.get('/records/:record', function (req, res, next) {
  req.record.populate('comments', function (err, record) {
    if (err) { return next(err);}
    res.json(req.record);  
  })  
});

router.post('/records/:record', function (req, res, next) {   
  var con = {_id: req.params.id};
  
  req.record.update(con, req.body)
  .then(record => {
    if(!record) { return res.status(404).end();}
    return res.status(200).json(record);
       
  })
  .catch(err => next(err));
  }) ; 


router.put('/records/:record/upvote',  function (req, res, next) {
  console.log(req);
  req.record.upvote(function(err, record) {
    if (err) return next(err);
    res.json (record);
  })
});

router.put('/records/:record/comments/:comment/upvote', auth, function (req, res, next ) {
  req.comment.upvote(function (err, comment) {
    if(err) return next (err);
    res.json (comment);
  })
});

router.post('/records/:record/comments', auth, function (req, res, next) {
  var comment = new Comment(req.body);
  comment.record = req.record;
  comment.author = req.payload.username;
  
  comment.save(function (err, comment) {
    if( err) { return next(err)};
    
    req.record.comments.push(comment);
    req.record.save(function (err, record) { 
      if (err) {return next (err) }
      
    res.json (comment)})
  })
});

router.post('/register', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'Please fill out all the fields.'});
  }
  console.log('ok');
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);
  user.save( function (err) {
    if (err) {console.log("prob"); return next(err) ; }
    return res.json({token: user.generateJWT()});
  });
});

router.post('/login', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'Please fill out all the fields.'});
  }
  
  passport.authenticate('local', function(err, user, info){
    if (err) {return next (err);}
    
    if (user) {
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  }) (req, res, next);
});


module.exports = router;