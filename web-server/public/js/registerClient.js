var pomelo = window.pomelo;
var globalUsername;
var globalUserId;
var globalRoomId;
var globalRoomName;
var globalroomList;
var globalUserList;
var heng = "<hr />";
var base = 1000;
var increase = 25;

$(document).ready(function() {
	$("#pop").hide();
	$("#roomListView").hide();
	$("#chatView").hide();
	$("#loginView").show();
	$("registerView").hide();

	$("#registButton").click(function() {
		register();
	});
	$("#loginButton").click(function() {
		login();
	});

	$("#clb").click(function(){
		chatlog();
	});

	//wait message from the server.
	pomelo.on('onChat', function(data) {
		addMessage(data.from, data.target, data.msg, new Date());
		$("#chatHistory").show();
		if (data.from !== globalUsername) tip('message', data.from);
	});

	//update user list
	pomelo.on('onAdd', function(data) {
		tip('online', globalUsername);
		addUser(data);
	});

	//update user list
	pomelo.on('onLeave', function(data) {
		var username = data.username;
		tip('offline', username);
		removeUser(username);
	});

	//deal with chat mode.
	$("#chatSend").click(function() {
		var route = "chat.chatHandler.send";
		var userid = $("#usersList").val();
		var target;
		if (userid == "*") {
			target = "*";
			userid = "";
		} else {
			for (var i = 0; i < globalUserList.length; i++) {
				var user = globalUserList[i];
				if (userid == user.userid) {
					target = user.username;
				}
			};
		};
		var msg = $("#entry").attr("value").replace("\n", "");
		if (!util.isBlank(msg)) {
			pomelo.request(route, {
				roomid: '1',
				content: msg,
				userid: userid,
				target: target
			}, function(data) {
				$("#entry").attr("value", ""); // clear the entry field.
				if (target != '*' && target != globalUsername) {
					addMessage(globalUsername, target, msg);
					$("#chatHistory").show();
				}
			});
		};
	});
});


function addRoomList(roomList) {
	var divAll;
	divAll = divAll + heng;
	var table = $("#roomListView");
	for (var roomname in roomList) {
		var room = roomList[roomname];
		var divSigle = "<input type='button' value='" + room.name + "' id='" + room.name + "' onclick='room(&quot;" + room.id + "&quot;)' />";
		divAll = divAll + (divSigle);
	};
	table.append(divAll);
	globalroomList = roomList;
	$("#roomListView").show();
	$("#chatView").hide();
	$("#loginView").hide();
};

function setChatInfo(userList, roomName) {
	globalUserList = userList;
	setName(globalUsername);
	setRoom(roomName);
	initUserList(userList);
	$("#roomListView").hide();
	$("#chatView").show();
	$("#loginView").hide();
};

function showChatLog(chatLogList){
	var div ;
	for(var i=0;i<chatLogList.length;i++){
		var chatLog = chatLogList[i];
		var logdiv = chatLog.from_user_name +" to "+chatLog.to_user_name+": "+chatLog.context+"||";
		div = div +logdiv;
	}
	alert(div);
};

/*
 *
 *前台 registerButton按钮触发方法
 *调用 registerEntry
 */

function register() {
	var name = $('#reg-name').val().trim();
	var pwd = $('#reg-pwd').val().trim();
	var cpwd = $('#reg-cpwd').val().trim();
	var role = $('#role').val().trim();
	$('#reg-pwd').val('');
	$('#reg-cpwd').val('');
	//校验 是否为空
	if (name === '') {
		alert('Username is required!');
		return;
	}
	if (pwd === '') {
		alert('Password is required!');
		return;
	}
	if (pwd != cpwd) {
		alert('Entered passwords differ!');
		return;
	}
	registerEntry(name, pwd, role, function(res) {
		if (res == 'success') {
			alert('恭喜 注册成功。用户名：' + name);
		} else {
			if (res === 0) {
				alert('PASSWORDERROR');
				return;
			}
			if (res === 1) {
				alert('NOUSERNAME');
				return;
			}
			if (res === 2) {
				alert('ALREADYHASUSER');
				return;
			}
		};
	});
};
/*
 *
 *前台 loginButton按钮触发方法
 *调用 loginEntry
 */

function login() {
	var name = $('#login-name').val().trim();
	var pwd = $('#login-pwd').val().trim();
	//校验 是否为空
	if (name === '') {
		alert('Username is required!');
		return;
	}
	if (pwd === '') {
		alert('Password is required!');
		return;
	}
	loginEntry(name, pwd, function(res) {
		if (res == 'success') {} else {
			if (res === 0) {
				alert('PASSWORDERROR');
				return;
			}
			if (res === 1) {
				alert('NOUSERNAME');
				return;
			}
			if (res === 2) {
				alert('ALREADYHASUSER');
				return;
			}
		};
	});
};

/*
 *
 *chatLog
 */

function chatlog() {
	chatLogEntry(function(data){
		showChatLog(data);
	});
};

/*
 *
 *
 */

function room(roomName) {
	roomEntry(roomName, function(data) {
		if (data == null) {
			alert("进入房间失败");
		} else {
			alert("进入房间成功");
			setChatInfo(data, roomName);
		};
	});
};

/*
 * 调用 10.0.1.44服务端借口
 * gate.gateHandler.register
 * @param  {String}   username
 * @param  {String}   password
 * @param  {int}      role       {0:DEFAULT,1:REGISTER,3:ADMIN}
 * @return {int}      code       200 is success
 * @return {int}      err
 * @return {int}      host       code is 200
 * @return {int}      port       code is 200
 * @return {int}      userid     only
 */

function registerEntry(username, password, role, cb) {
	var route = 'gate.gateHandler.register';
	pomelo.init({
		host: '10.0.1.44',
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			username: username,
			password: password,
			role: role
		}, function(data) {
			pomelo.disconnect();
			if (data.code !== 200) {
				cb(data.err.errorcode);
			} else {
				cb('success');
				var userid = data.userid;
				var host = data.host;
				var port = data.port;
				//	login(userid,host,port,function(roomlist){
				//		alert(roomlist);
				//	});
			};
		});
	});
};

/*
 * 调用 10.0.1.44服务端借口
 * gate.gateHandler.login
 * @param  {String}   username
 * @param  {String}   password
 * @return {int}      code       200 is success
 * @return {list}      err
 * @return {int}      host       code is 200
 * @return {int}      port       code is 200
 * @return {int}      userid     only
 * @return {int}      role
 */

function loginEntry(username, password, cb) {
	var route = 'gate.gateHandler.login';
	pomelo.init({
		host: '10.0.1.44',
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			username: username,
			password: password
		}, function(data) {
			pomelo.disconnect();
			if (data.code !== 200) {
				cb(data.err.errorcode);
			} else {
				cb('success');
				var userid = data.userid;
				var host = data.host;
				var port = data.port;
				var role = data.role;
				hallEntry(userid, username, host, port, function(hcb) {
					if (hcb == null) {
						alert('大厅进入失败:' + hcb);
					} else {
						alert("进入大厅");
						addRoomList(hcb);
						globalUsername = username;
						globalUserId = userid;
					};
				});
			};
		});
	});
};



/*
 *
 *调用 服务端借口{host,port}
 *connector.entryHandler.enter
 *@param  {int}   userid
 *@return {int}   code           200 is success
 *@return {List<String>}  roomlist
 */

function hallEntry(userid, username, host, port, cb) {
	var route = "connector.entryHandler.enter";
	pomelo.init({
		host: host,
		port: port,
		log: true
	}, function() {
		pomelo.request(route, {
			userid: userid,
			username: username
		}, function(data) {
			//pomelo.disconnect();
			if (data.code !== 200) {
				cb(null);
			} else {
				cb(data.roomlist);
			};
		});
	});
};

/*
 *
 *调用 服务端借口{host,port}
 *connector.entryHandler.enter
 *@param  {int}   userid
 *@return {int}   code           200 is success
 *@return {List<String>}  roomlist
 */

function roomEntry(channel, cb) {
	var route = "connector.entryHandler.enterRoom";
	pomelo.request(route, {
		userid: globalUserId,
		username: globalUsername,
		channel: channel
	}, function(data) {
		//pomelo.disconnect();
		if (data.code !== 200) {
			cb(null);
		} else {
			cb(data.users);
		};
	});
};

/*
 *
 *调用 服务端借口{host,port}
 *connector.entryHandler.enter
 *@param  {int}   userid
 *@return {int}   code           200 is success
 *@return {List<String>}  roomlist
 */

function sendEntry(userid, target, content, cb) {
	var route = "chat.chatHandler.send";
	pomelo.request(route, {
		userid: userid,
		target: target,
		content: content
	}, function(data) {
		//pomelo.disconnect();
		if (data.code !== 200) {
			cb(null);
		} else {
			cb(data.users);
		};
	});
};

/*
 *
 *
 */

function chatLogEntry(cb) {
	var route = "chat.chatHandler.query";
	pomelo.request(route, {
		userid: globalUserId,
		roomid: globalRoomId
	}, function(data) {
		//pomelo.disconnect();
		if (data.code !== 200) {
			cb(null);
		} else {
			cb(data.chatlog);
		};
	});
};


// set your name

function setName(username) {
	$("#name").text(username);
};

// set your room

function setRoom(rid) {
	for (var i = 0; i < globalroomList.length; i++) {
		var room = globalroomList[i];
		if (room.id == rid) {
			globalRoomName = room.name;
			break;
		};
	};
	$("#room").text(globalRoomName);
	globalRoomId = rid;
};
// init user list

function initUserList(data) {
	users = data;
	for (var i = 0; i < users.length; i++) {
		var slElement = $(document.createElement("option"));
		slElement.attr("value", users[i].userid);
		slElement.text(users[i].username);
		$("#usersList").append(slElement);
	};
};

// add user in user list

function addUser(user) {
	var slElement = $(document.createElement("option"));
	slElement.attr("value", user.userid);
	slElement.text(user.username);
	$("#usersList").append(slElement);
	globalUserList.push(user);
};

// remove user from user list

function removeUser(user) {
	$("#usersList option").each(

	function() {
		if ($(this).val() === user) $(this).remove();
	});
};

// add message on board

function addMessage(from, target, text, time) {
	var name = (target == '*' ? 'all' : target);
	if (text === null) return;
	if (time == null) {
		// if the time is null or undefined, use the current time.
		time = new Date();
	} else if ((time instanceof Date) === false) {
		// if it's a timestamp, interpret it
		time = new Date(time);
	}
	//every message you see is actually a table with 3 cols:
	//  the time,
	//  the person who caused the event,
	//  and the content
	var messageElement = $(document.createElement("table"));
	messageElement.addClass("message");
	// sanitize
	text = util.toStaticHTML(text);
	var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
	messageElement.html(content);
	//the log is the stream that we view
	$("#chatHistory").append(messageElement);
	base += increase;
	scrollDown(base);
};

// show tip

function tip(type, name) {
	var tip, title;
	switch (type) {
		case 'online':
			tip = name + ' is online now.';
			title = 'Online Notify';
			break;
		case 'offline':
			tip = name + ' is offline now.';
			title = 'Offline Notify';
			break;
		case 'message':
			tip = name + ' is saying now.'
			title = 'Message Notify';
			break;
	}
	var pop = new Pop(title, tip);
};
util = {
	urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	//  html sanitizer
	toStaticHTML: function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	//pads n with zeros on the left,
	//digits is minimum length of output
	//zeroPad(3, 5); returns "005"
	//zeroPad(2, 500); returns "500"
	zeroPad: function(digits, n) {
		n = n.toString();
		while (n.length < digits)
		n = '0' + n;
		return n;
	},
	//it is almost 8 o'clock PM here
	//timeString(new Date); returns "19:49"
	timeString: function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	//does the argument only contain whitespace?
	isBlank: function(text) {
		var blank = /^\s*$/;
		return (text.match(blank) !== null);
	}
};
//always view the most recent message when it is added

function scrollDown(base) {
	window.scrollTo(0, base);
	$("#entry").focus();
};