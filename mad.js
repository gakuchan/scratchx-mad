/* Extension to control a Mugbot from Scratch */
/* Manabu Sugiura, April 2017 */

(function(ext) {

  var socket;
  var ip;
  var faceX;
  var faceY;

  var INPUT_IP_MESSAGE;
  var CONNECTION_FAIL_MESSAGE;
  var INVALID_IP_MESSAGE;
  var CONNECT_MESSAGE;

  var STATUS_READY_MESSAGE;
  var STATUS_NOT_READY_MESSAGE;

  var FACE_TURN = 0;
  var SET_RIGHT = 1;
  var SET_LEFT = 2;
  var SET_UP = 3;
  var SET_DOWN = 4;
  var EYE = 5;
  var SPEECH = 6;

  function blockWait(type, arg, callback) {
    var wait;
    switch (type) {
      case FACE_TURN:
        wait = 5 * Math.abs(arg);
        break;
      case SET_RIGHT:
        wait = Math.abs(faceX - (90 - Number(arg))) * 5;
        break;
      case SET_LEFT:
        wait = Math.abs(faceX - (90 + Number(arg))) * 5;
        break;
      case SET_DOWN:
        wait = Math.abs(faceY - (90 - Number(arg))) * 5;
        break;
      case SET_UP:
        wait = Math.abs(faceY - (90 + Number(arg))) * 5;
        break;
      case EYE:
        wait = 5;
        break;
      case SPEECH:
        wait = arg.length * 160 + 2500;
        break;
      default:
        console.log("Invalid argument of type");
        break;
    }
    setTimeout(function() {
      callback();
    }, wait);
  }

  function socketReady() {
    if (socket != null && socket.readyState == WebSocket.OPEN) {
      return true;
    } else {
      return false;
    }
  }

  function initializeSocket(callback1, arg, callback2) {
    if (socketReady()) {
      return;
    }

    ip = prompt(INPUT_IP_MESSAGE, '192.168.x.x');
    if (!ip) {
      callback2();
      return;
    }

    try {
      socket = new WebSocket('ws://' + ip + ':51234');
      setTimeout(function () {
        if (socket != null && socket.readyState == WebSocket.CONNECTING) {
          alert(CONNECTION_FAIL_MESSAGE + ' (IP:' + ip + ') ');
          console.log('WebSocket Timeout');
          socket.releaseWaitBlock();
          socket = null;
        }
      }
      , 3000); // initial WebSocket connection timeout
    } catch (e) {
      alert(INVALID_IP_MESSAGE);
      callback2();
    }

    socket.releaseWaitBlock = function(){
      callback2();
    }

    socket.onopen = function() {
      alert(CONNECT_MESSAGE);
      socket.send('@n'); // initialize face direction
      faceX = 90;
      faceY = 90;

      callback1(arg, callback2);
    };

    socket.onclose = function(error) {
      if (socket != null) {
        alert(CONNECTION_FAIL_MESSAGE + ' (IP:' + ip + ')');
        callback2();
        console.log('WebSocket Error ' + error.code);
        socket = null;
      }
    };
  }

  ext._shutdown = function() {
    if (socketReady()) {
      socket.close();
    }
  };

  ext._getStatus = function() {
    if (socketReady()) {
      return {
        status: 2,
        msg: STATUS_READY_MESSAGE
      };
    } else {
      return {
        status: 1,
        msg: STATUS_NOT_READY_MESSAGE
      };
    }
  };

  ext.turnFaceRight = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.turnFaceRight, angle, callback);
    }else{
      if (faceX - Number(angle) >= 0 && faceX - Number(angle) <= 180) {
        faceX -= Number(angle);
        socket.send("@x" + faceX);
      }
      blockWait(FACE_TURN, angle, callback);
    }
  };

  ext.setFaceRight = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.setFaceRight, angle, callback);
    }else{
      if (angle > 90) {
        angle = 90;
      } else if (angle < -90) {
        angle = -90;
      }
      faceX = 90 - Number(angle);
      socket.send("@x" + faceX);
      blockWait(SET_RIGHT, angle, callback);
    }
  };

  ext.turnFaceLeft = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.turnFaceLeft, angle, callback);
    }else{
      if (faceX + Number(angle) >= 0 && faceX + Number(angle) <= 180) {
        faceX += Number(angle);
        socket.send("@x" + faceX);
      }
      blockWait(FACE_TURN, angle, callback);
    }
  };

  ext.setFaceLeft = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.setFaceLeft, angle, callback);
    }else{
      if (angle > 90) {
        angle = 90;
      } else if (angle < -90) {
        angle = -90;
      }
      faceX = 90 + Number(angle);
      socket.send("@x" + faceX);
      blockWait(SET_LEFT, angle, callback);
    }
  };

  ext.turnFaceUp = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.turnFaceUp, angle, callback);
    }else{
      if (faceY + Number(angle) >= 75 && faceY + Number(angle) <= 105) {
        faceY += Number(angle);
        socket.send("@y" + faceY);
      }
      blockWait(FACE_TURN, angle, callback);
    }
  };

  ext.setFaceUp = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.setFaceUp, angle, callback);
    }else{
      if (angle > 15) {
        angle = 15;
      } else if (angle < -15) {
        angle = -15;
      }
      faceY = 90 + Number(angle);
      socket.send("@y" + faceY);
      blockWait(SET_UP, angle, callback);
    }
  };

  ext.turnFaceDown = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.turnFaceDown, angle, callback);
    }else{
      if (faceY - Number(angle) >= 75 && faceY - Number(angle) <= 105) {
        faceY -= Number(angle);
        socket.send("@y" + faceY);
      }
      blockWait(FACE_TURN, angle, callback);
    }
  };

  ext.setFaceDown = function(angle, callback) {
    if(!socketReady()){
      initializeSocket(this.setFaceDown, angle, callback);
    }else{
      if (angle > 15) {
        angle = 15;
      } else if (angle < -15) {
        angle = -15;
      }
      faceY = 90 - Number(angle);
      socket.send("@y" + faceY);
      blockWait(SET_DOWN, angle, callback);
    }
  };

  ext.speech = function(str, callback) {
    if(!socketReady()){
      initializeSocket(this.speech, str, callback);
    }else{
      socket.send(str);
      blockWait(SPEECH, str, callback);
    }
  };

  ext.setEyesBrightness = function(n, callback) {
    if(!socketReady()){
      initializeSocket(this.setEyesBrightness, n, callback);
    }else{
      if (n > 255) {
        n = 255;
      } else if (n < 0) {
        n = 0;
      }
      socket.send("@z" + n);
      blockWait(EYE, n, callback);
    }
  };

  var paramString = window.location.search.replace(/^\?|\/$/g, '');
  var vars = paramString.split("&");
  var lang = 'ja';
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair.length > 1 && pair[0] == 'lang'){
      if (pair[1] == 'en' || pair[1] == 'ja'){
        lang = pair[1];
      }
    }
  }

  switch (lang) {
    case 'en':
      INPUT_IP_MESSAGE = 'Enter the IP address of Mugbot.';
      CONNECTION_FAIL_MESSAGE = 'Connection failed to Mubot.';
      INVALID_IP_MESSAGE = 'IP address is invalid.';
      CONNECT_MESSAGE = 'Successfully connected to Mugbot.'
      STATUS_READY_MESSAGE = 'Ready';
      STATUS_NOT_READY_MESSAGE = 'Not Ready';
      break;
    case 'ja':
      INPUT_IP_MESSAGE = 'MugbotのIPアドレスを入力してください。';
      CONNECTION_FAIL_MESSAGE = 'Mugbotに接続できません。';
      INVALID_IP_MESSAGE = 'IPアドレスを正しく入力してください。';
      CONNECT_MESSAGE = 'Mugbotとの接続を開始しました。';
      STATUS_READY_MESSAGE = '接続中';
      STATUS_NOT_READY_MESSAGE = '未接続';
      break;
    default:
      break;
  }

  var blocks = {
    en: [
      ['w', 'turn face right %n degrees', 'turnFaceRight', '10'],
      ['w', 'set face right %n degrees', 'setFaceRight', '45'],
      ['w', 'turn face left %n degrees', 'turnFaceLeft', '10'],
      ['w', 'set face right %n degrees', 'setFaceLeft', '45'],
      ['w', 'turn face up %n degrees', 'turnFaceUp', '5'],
      ['w', 'set face up %n degrees', 'setFaceUp', '15'],
      ['w', 'turn face down %n degrees', 'turnFaceDown', '5'],
      ['w', 'set face down %n degrees', 'setFaceDown', '15'],
      ['w', 'speech %s', 'speech', 'I\'m Mugbot!'],
      ['w', 'set brightness of eyes to %n', 'setEyesBrightness', '255']
    ],
    ja: [
      ['w', '顔を右に %n 度回す', 'turnFaceRight', '10'],
      ['w', '顔を右 %n 度に向ける', 'setFaceRight', '45'],
      ['w', '顔を左に %n 度回す', 'turnFaceLeft', '10'],
      ['w', '顔を左 %n 度に向ける', 'setFaceLeft', '45'],
      ['w', '顔を上に %n 度回す', 'turnFaceUp', '5'],
      ['w', '顔を上 %n 度に向ける', 'setFaceUp', '15'],
      ['w', '顔を下に %n 度回す', 'turnFaceDown', '5'],
      ['w', '顔を下 %n 度に向ける', 'setFaceDown', '15'],
      ['w', '%s としゃべる', 'speech', '私はマグボットです'],
      ['w', '目の明るさを %n にする', 'setEyesBrightness', '255']
    ]
  };

  var descriptor = {
    blocks: blocks[lang],
    url: 'http://gakuchan.github.io/scratchx-mad'
  };

  ScratchExtensions.register('Mugbot Action Designer', descriptor, ext);
})({});
