function LocalShip(game,socket,id,canvas,x,y) {
  Ship.call(this, game, socket, id, x, y);
  this.onKeyDown = this.onKeyDown.bind(this); //can't do inline if they're to be removed later
  this.onKeyUp = this.onKeyUp.bind(this); //can't do inline if they're to be removed later
  this.onMouseMove = this.onMouseMove.bind(this); //can't do inline if they're to be removed later
  this.onMouseDown = this.onMouseDown.bind(this); //can't do inline if they're to be removed later

  window.addEventListener("keydown", this.onKeyDown, false);
  window.addEventListener("keyup", this.onKeyUp, false);
  canvas.addEventListener("mousemove", this.onMouseMove, false);
  canvas.addEventListener("mousedown", this.onMouseDown, false);
  this.canvas = canvas;

  this.lastUpdate = 0;
}

LocalShip.prototype = Object.create(Ship.prototype);
LocalShip.prototype.constructor = LocalShip;

LocalShip.prototype.onKeyDown = function(event) {
  var keyCode = event.keyCode ? event.keyCode : event.which;
  switch(keyCode) {
    case Config.STRAFE_LEFT_KEY:
      this.strafe = Config.STRAFE_THRUST;
      break;
    case Config.STRAFE_RIGHT_KEY:
      this.strafe = -Config.STRAFE_THRUST;
      break;
    case Config.FORWARD_KEY:
      this.thruster = Config.THRUST;
      break;
    case Config.REVERSE_KEY:
      this.thruster = -Config.THRUST;
      break;
  }
};

LocalShip.prototype.onKeyUp = function(event) {
  var keyCode = event.keyCode ? event.keyCode : event.which;
  switch(keyCode) {
    case Config.STRAFE_LEFT_KEY:
      if(this.strafe > 0)
        this.strafe = 0;
      break;
    case Config.STRAFE_RIGHT_KEY:
      if(this.strafe < 0)
        this.strafe = 0;
      break;
    case Config.FORWARD_KEY:
      if(this.thruster > 0)
        this.thruster = 0;
      break;
    case Config.REVERSE_KEY:
      if(this.thruster < 0)
        this.thruster = 0;
      break;
  }
};

LocalShip.prototype.onMouseMove = function(event) {
  this.target.x = event.clientX;
  this.target.y = event.clientY;
  this.theta = Math.atan2(this.target.y - this.loc.y, this.target.x - this.loc.x);
};

LocalShip.prototype.onMouseDown = function(event) {
  this.game.launchMissile(this, this.target.sub(this.loc));
};
LocalShip.prototype.update = function(dt) {
  var dir = this.target.sub(this.loc).normalized();
  this.theta = Math.atan2(dir.y, dir.x);
  var rotDir = new Vec2(dir.y, -dir.x);
  this.acc = dir.mul(this.thruster);
  this.acc = this.acc.add(rotDir.mul(this.strafe));
  this.acc.mul(dt);
  this.vel = this.vel.add(this.acc);
  Ship.prototype.update.call(this, dt);
  if(this.socket) { // && (Date.now() - Config.UPDATE_DELAY > this.lastUpdate)) {
    //this.lastUpdate = Date.now();
    this.socket.emit("update", {
      id: this.id,
      locX: this.loc.x,
      locY: this.loc.y,
      velX: this.vel.x,
      velY: this.vel.y,
      theta: this.theta
    });
  }
};

LocalShip.prototype.draw = function(gfx) {
  Ship.prototype.draw.call(this, gfx);
  /*this.makePath(gfx);
  if(!gfx.isPointInPath(this.target.x, this.target.y)) gfx.strokeStyle = "rgb(255,255,255)";
  else gfx.strokeStyle = "rgb(255,0,0)";*/
  gfx.strokeStyle = "rgb(255,255,255)";
  gfx.save();
  gfx.translate((this.target.x+0.5)|0, (this.target.y+0.5)|0); //round coords
  gfx.beginPath();
  gfx.moveTo(-5,0);
  gfx.lineTo(5,0);
  gfx.moveTo(0,5);
  gfx.lineTo(0,-5);
  gfx.stroke();
  gfx.restore();
};

LocalShip.prototype.destroy = function() {
  Ship.prototype.destroy.call(this);
  window.removeEventListener("keydown", this.onKeyDown, false);
  window.removeEventListener("keyup", this.onKeyUp, false);
  this.canvas.removeEventListener("mousemove", this.onMouseMove, false);
  this.canvas.removeEventListener("mousedown", this.onMouseDown, false);
};
