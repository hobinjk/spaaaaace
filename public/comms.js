/*
if(!window.RTCPeerConnection) {
  window.RTCPeerConnection = window.mozRTCPeerConnection;
}

//shamelessly stolen from mozilla example
function initializeConnection() {
  var con = new RTCPeerConnection();

  con.ondatachannel = function(event) {
    channel = event.channel;
    channel.onmessage = function(event) {
      //received msg from remote
      console.log("remote said: "+event.data);
    };
    channel.onopen = function(event) {
      //can now send and such
      channel.send("hallo!");
    };
  }
  con.onconnection = function() {
    console.log("connection made");
  };

  navigator.mozGetUserMedia({
}
*/
