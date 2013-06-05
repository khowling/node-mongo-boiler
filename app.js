
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , mongo = require('mongodb')
  , path = require('path');


var app = express();


mongo.connect((process.env.MONGOLAB_URI || 'mongodb://localhost:27017/mydb'), function(err, conn){
    conn.collection('online', function(err, coll){

		// all environments
		app.set('port', process.env.PORT || 3000);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.static(path.join(__dirname, 'public')));

		app.use(function(req, res, next){
			coll.insert({ date: Date.now(), agent: req.headers['user-agent']}, function (res) { 
				next();});
		});


		app.use(function(req, res, next){
			coll.find().toArray( function(err , users){
				req.online = users; next();
			});
		});

		app.use(app.router);

		// development only
		if ('development' == app.get('env')) {
			app.use(express.errorHandler());
		}

		app.get('/', routes.index);
		app.get('/users', user.list);

		http.createServer(app).listen(app.get('port'), function(){
			console.log('Express server listening on port ' + app.get('port'));
		});


	});
});
