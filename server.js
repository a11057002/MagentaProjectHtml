var http = require('http');
var fs = require('fs');
var exec = require('child_process').exec;
var express = require('express');
var router = express.Router();
//const { spawn } = require('child_process');
http.createServer(function(request, response)
{
	if (request.url == "/" || request.url == './index')
	{
		response.writeHeader(200, {"Content-Type": "text/html"});
		fs.createReadStream("./MagentaProjectHtml/web/index.html").pipe(response);
	}
	else if(request.url.includes('button'))
	{
//		const music = spawn('bash ' , ['./open.sh']);
//		music.stdout.on('data',(data)=>{console.log(`${data}`)})
		exec('bash /home/chang/musegan/run.sh',function(err, stdout, stderr)
		{
			console.log('---------------------')	
			console.log(err);
			console.log('---------------------')
			console.log(stdout);
			console.log('---------------------')
			console.log(stderr); 
			console.log('===========');
			response.writeHeader(200,{"Content-Type" : "application/xtar"});
			fs.createReadStream("/home/chang/musegan/output.tar").pipe(response);
//			router.get('/button',function(req,res){
//				res.download('/home/chang/musegan/output','output');
//			})
		});
	}
	else if (!request.url.includes('icon'))
	{
		if (request.url.includes('html')) response.writeHeader(200,{'Content-Type': 'text/html'});
		else response.writeHeader(200, {"Content-Type": "text/javascript"});
		try
		{
			fs.createReadStream("./MagentaProjectHtml" + request.url).pipe(response);
		}
		catch(e)
		{
			console.log(e);
		}
	}
	
}).listen(3000, '140.121.197.92');
console.log('listen 140.121.197.92:3000');
