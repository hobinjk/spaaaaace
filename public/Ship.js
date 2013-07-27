function Ship(game,socket,id,x,y) {
  this.game = game;
  this.socket = socket;
  this.id = id;

  this.loc = new Vec2(x, y);
  this.vel = new Vec2(0, 0);
  this.acc = new Vec2(0, 0);
  this.theta = 0;
  this.dTheta = 0;

  this.thruster = 0;
  this.strafe = 0;
  this.target = new Vec2(0, 0);
  this.acc = 0.1;

  this.destroyed = false;
}

Ship.prototype.update = function(dt) {
  this.vel = this.vel.limit(Config.MAX_VEL);
  this.loc = this.loc.add(this.vel.mul(dt));
};

Ship.prototype.draw = function(gfx) {
  this.makePath(gfx);
  gfx.fillStyle = "rgb(255,255,255)";
  gfx.fill();
};

Ship.prototype.makePath = function(gfx) {
  gfx.save();
  gfx.translate(this.loc.x, this.loc.y);
  gfx.rotate(this.theta);
  gfx.beginPath();
  gfx.moveTo(10,0);
  gfx.lineTo(-10,5);
  gfx.lineTo(-5,0);
  gfx.lineTo(-10,-5);
  gfx.lineTo(10,0);
  gfx.restore();
};

Ship.prototype.destroy = function() {
  this.destroyed = true;
  this.socket.emit('destroyed', {'id': this.id});
};
