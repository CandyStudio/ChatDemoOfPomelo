var pomelo = window.pomelo;

$(document).ready(function() {
    $("#conntect").click(function(){
        alert('dd');
        var host = $('#host').val().trim();
        var port = $('#port').val().trim();
        firstConntectTOGate(host,port,function(data4first){
            if (data4first.code !== 200) {
//				cb(data4first.err.errorcode);
                showConnRes(1,"fail","null","null");
			}else{
                var sedHost = data4first.host;
				var sedPort = data4first.port;
                alert(sedHost+':'+sedPort);
                showConnRes(1,"success",host,port);
                secondConnectToConnector(sedHost,sedPort,function(data4second){
                    showConnRes(2,data4second,sedHost,sedPort);
                });
            }
        });
    });

    $("#testServer").click(function(){
        var api = $('#api').val().trim();
        var htmlParams = $('#params').val().trim();
        var params = JSON.parse(htmlParams);
        serverTest(api,params,function(testData){
            $("#finallyText").val(JSON.stringify(testData));
        });
    });

});

function firstConntectTOGate(host,port,cb){
    var route = "gate.gateHandler.entry";
    pomelo.init({
        host: host,
        port: port,
        log: true
    }, function() {
        pomelo.request(route, {
                userid:'123321',
                token:'d43a8f028b35068bc95c91b80528c21928c5dc81084285339bad71084f011b48'},
            function(data) {
            pomelo.disconnect();
            cb(data);
        });
    });
}

function secondConnectToConnector(host,port,cb){
    var route = "connector.entryHandler.entry";
    alert('sec');
    pomelo.init({
        host: host,
        port: port,
        log: true
    }, function() {
        pomelo.request(route,
            {
                userid:'123321',
                token:'d43a8f028b35068bc95c91b80528c21928c5dc81084285339bad71084f011b48'
            },
            function(data) {
            if (data.code !== 500) {
                cb("success");
            } else {
                cb("fail");
            }
        });
    });
}

function showConnRes(time,res,host,port){
    if(time == 1){
        var hostPortString ="gate-->"+host+":"+port+"\r\n";
    }else if(time==2){
        var hostPortString ="conntector-->"+host+":"+port+"\r\n";
    }
    var resString=res+"!!\r\n";

    var conn = $("#connText").val();
    $("#connText").val(conn+hostPortString+resString);
}

function serverTest(api,params,cb){
    pomelo.request(api, params,
        function(data) {
        cb(data);
    });
}