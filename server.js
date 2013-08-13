var app = require('http').createServer(handler),
    fs = require('fs'),
    url = require('url'),
    mime = require('mime');

app.listen(3000);

var allowed = fs.readdirSync(__dirname+"/public/");
function handler(req, res) {
  var pathname = url.parse(req.url).pathname.substr(1);
  if(pathname === "")
    pathame = "space.html";
  if(allowed.indexOf(pathname) < 0) {
    res.writeHead(404);
    return res.end(pathname+" not found");
  }
  var filename = __dirname+"/public/"+pathname;
  var ctype = mime.lookup(filename);
  fs.readFile(filename, function(err, data) {
    if(err) {
      res.writeHead(500);
      return res.end("Error loading "+pathname);
    }
    res.writeHead(200, {"Content-Type": ctype});
    return res.end(data);
  });
}

var Space = require('./space.js');
var space = new Space(app);

space.enemyUpdate();
