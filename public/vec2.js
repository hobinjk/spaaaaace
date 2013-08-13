function Vec2(x,y) {
  this.x = x;
  this.y = y;
}

Vec2.prototype.mul = function(k) {
  var modx = this.x;
  var mody = this.y;
  if(k instanceof Vec2) {
    modx *= k.x;
    mody *= k.y;
  } else if(typeof(k) === "number") {
    modx *= k;
    mody *= k;
  } else {
    throw new Error("Invalid Argument: "+typeof(k));
  }
  return new Vec2(modx, mody);
};

Vec2.prototype.dot = function(vec) {
  return this.x*vec.x + this.y*vec.y;
};

Vec2.prototype.div = function(k) {
  var modx = this.x;
  var mody = this.y;
  if(k instanceof Vec2) {
    modx /= k.x;
    mody /= k.y;
  } else if(typeof(k) === "number") {
    modx /= k;
    mody /= k;
  } else {
    throw new Error("Invalid Argument");
  }
  return new Vec2(modx, mody);
};

Vec2.prototype.add = function(k) {
  var modx = this.x;
  var mody = this.y;
  if(k instanceof Vec2) {
    modx += k.x;
    mody += k.y;
  } else if(typeof(k) === "number") {
    modx += k;
    mody += k;
  } else {
    throw new Error("Invalid Argument");
  }
  return new Vec2(modx, mody);
};

Vec2.prototype.sub = function(k) {
  var modx = this.x;
  var mody = this.y;
  if(k instanceof Vec2) {
    modx -= k.x;
    mody -= k.y;
  } else if(typeof(k) === "number") {
    modx -= k;
    mody -= k;
  } else {
    throw new Error("Invalid Argument");
  }
  return new Vec2(modx, mody);
};

Vec2.prototype.mag = function() {
  return Math.sqrt(this.magSq());
};

Vec2.prototype.magSq = function() {
  return this.x*this.x + this.y*this.y;
};

Vec2.prototype.normalized = function() {
  var mag = this.mag();
  if(mag > 0.000001)
    return this.div(this.mag());
  return this;
};

Vec2.prototype.limit = function(mag) {
  if(this.magSq() <= mag*mag) return this;
  return this.normalized().mul(mag);
};

if(typeof(module) !== "undefined") {
  module.exports = Vec2;
}
