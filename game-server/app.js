var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo');

app.set('onlineuser',0);

// app configure
app.configure('production|development', function() {
	// route configures
	app.route('chat', routeUtil.chat);

	// filter configures
	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');

//	app.filter(pomelo.timeout());
});


//Configure database
app.configure('production|development', function() {
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);
	// app.load(pomelo.sync,{path:__dirname+'/app/dao/mapping',dbclient:dbclient});



});




// start app
app.start();
if (app.curServer.serverType ==='chat' )
{

	console.log('create server');
	var channel = app.get('channelService').getChannel('tt1', true);
	console.log('create server:'+channel);
} else {

	console.log('XXX');
}
process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});