(function() {
   var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
   window.requestAnimationFrame = requestAnimationFrame;
})();


function SpaceGame() {
  this.canvas = document.querySelector("#space");
  this.width = this.canvas.width = window.innerWidth;
  this.height = this.canvas.height = window.innerHeight;

  this.gfx = this.canvas.getContext("2d");
  this.canvas.addEventListener("keydown", this.onKeyDown.bind(this));

  this.clear = true;

  this.missiles = [];

  this.socket = io.connect(LocalConfig.SERVER_URL);
  this.id = generateId();
  this.ships = [
    //new RemoteShip(this.socket,"you",this,-100,-100),
    new LocalShip(this,this.socket,this.id,this.canvas,150,150)
  ];

  this.socket.on('join', this.onJoin.bind(this));
  this.socket.on('missile', this.onMissile.bind(this));
  this.socket.on('destroyed', this.onDestroyed.bind(this));

  this.socket.emit(
      'join',
      {id: this.id, width: this.width, height: this.height}
  );

  this.lastStep = Date.now();
  this.draw();
}

SpaceGame.prototype.update = function() {
  var dt = (Date.now() - this.lastStep)/1000.0;
  for(var i = 0; i < this.ships.length; i++) {
    this.ships[i].update(dt);
  }
  for(i = 0; i < this.missiles.length; i++) {
    this.missiles[i].update(this.gfx, dt, this.ships);
  }
  this.ships = this.ships.filter(function(ship) {
      return !ship.destroyed;
  });
  this.missiles = this.missiles.filter(function(miss) {
      return !miss.destroyed;
  });
};
SpaceGame.prototype.draw = function() {
  this.update();
  if(this.clear) {
    this.gfx.fillStyle = "black";
    this.gfx.fillRect(0,0,this.canvas.width,this.canvas.height);
  }
  for(var i = 0; i < this.ships.length; i++) {
    this.ships[i].draw(this.gfx);
  }
  for(i = 0; i < this.missiles.length; i++) {
    this.missiles[i].draw(this.gfx);
  }
  this.lastStep = Date.now();
  requestAnimationFrame(this.draw.bind(this));
};

SpaceGame.prototype.launchMissile = function(ship, dir) {
  var missLoc = ship.loc.add(dir.normalized().mul(11));
  this.socket.emit('missile', {
      'dirX': dir.x,
      'dirY': dir.y,
      'locX': missLoc.x,
      'locY': missLoc.y
  });
};

SpaceGame.prototype.onMissile = function(data) {
  var loc = new Vec2(data.locX, data.locY);
  var dir = new Vec2(data.dirX, data.dirY);

  var miss = new Missile(this, data.id, loc, dir);
  this.missiles.push(miss); //dohohohoho
};

SpaceGame.prototype.onJoin = function(data) {
  for(var i = 0; i < this.ships.length; i++) {
    if(this.ships[i].id === data.id) return;
  }
  this.ships.push(new RemoteShip(this,this.socket,data.id,-100,-100));
};

SpaceGame.prototype.onDestroyed = function(data) {
  for(var i = 0; i < this.ships.length; i++) {
    if(this.ships[i].id != data.id) continue;
    if(this.ships[i].destroyed) continue;
    this.ships[i].destroy();
  }
};

SpaceGame.prototype.onKeyDown = function(e) {
  var keyCode = event.keyCode ? event.keyCode : event.which;
  if(keyCode === KeyEvent.DOM_VK_C)
    this.clear = !this.clear;
};

var game = new SpaceGame();

function generateId() {
  var id = "";
  for(var i = 0; i < 8; i++) {
    id += String.fromCharCode(Math.random()*78 + 48);
  }
  return id;
}


