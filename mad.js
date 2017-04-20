/* Extension to control a Mugbot from Scratch */
/* Manabu Sugiura, April 2017 */

(function(ext) {

  var socket;
  var faceX;
  var faceY;

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

    var ip = prompt('MugbotのIPアドレスを入力してください。', '192.168.x.x');
    if (!ip) {
      callback2();
      return;
    }

    try {
      socket = new WebSocket('ws://' + ip + ':51234');
      //初回接続時のタイムアウトは3秒
      setTimeout(function() {
        if (socket.readyState == WebSocket.CONNECTING) {
          alert('Mugbot（IP：' + ip + '）に接続できません。');
          callback2();
        }
      }, 3000);
    } catch (e) {
      alert('IPを正しく入力してください。');
      callback2();
    }

    socket.onopen = function() {
      //初期化コードの送信
      alert('スクラッチとの接続を開始しました。');
      socket.send('@n'); //顔の向きを初期化する
      faceX = 90;
      faceY = 90;

      callback1(arg, callback2);
    };

    socket.onerror = function(error) {
      alert('Mugbotとの接続でエラー（' + error + '）が発生しました。');
      callback2();
      console.log('WebSocket Error ' + error.code);
    };

    socket.onclose = function(error) {
      if (!socketReady()) { //一時的な切断を無視
        alert('Mugbot（IP：' + ip + '）に接続できません。');
        callback2();
        console.log('WebSocket Error ' + error.code);
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
        msg: 'Ready'
      };
    } else {
      return {
        status: 1,
        msg: 'Not Ready'
      };
    }
  };

  ext.turnFaceRight = function(angle, callback) {
    initializeSocket(this.turnFaceRight, angle, callback);

    blockWait(FACE_TURN, angle, callback);
    if (faceX - Number(angle) >= 0 && faceX - Number(angle) <= 180) {
      faceX -= Number(angle);
      socket.send("@x" + faceX);
    }
  };

  ext.setFaceRight = function(angle, callback) {
    initializeSocket(this.setFaceRight, angle, callback);

    if (angle > 90) {
      angle = 90;
    } else if (angle < -90) {
      angle = -90;
    }

    blockWait(SET_RIGHT, angle, callback);
    faceX = 90 - Number(angle);
    socket.send("@x" + faceX);
  };

  ext.turnFaceLeft = function(angle, callback) {
    initializeSocket(this.turnFaceLeft, angle, callback);

    blockWait(FACE_TURN, angle, callback);
    if (faceX + Number(angle) >= 0 && faceX + Number(angle) <= 180) {
      faceX += Number(angle);
      socket.send("@x" + faceX);
    }
  };

  ext.setFaceLeft = function(angle, callback) {
    initializeSocket(this.setFaceLeft, angle, callback);

    if (angle > 90) {
      angle = 90;
    } else if (angle < -90) {
      angle = -90;
    }

    blockWait(SET_LEFT, angle, callback);
    faceX = 90 + Number(angle);
    socket.send("@x" + faceX);
  };

  ext.turnFaceUp = function(angle, callback) {
    initializeSocket(this.turnFaceUp, angle, callback);

    blockWait(FACE_TURN, angle, callback);
    if (faceY + Number(angle) >= 75 && faceY + Number(angle) <= 105) {
      faceY += Number(angle);
      socket.send("@y" + faceY);
    }
  };

  ext.setFaceUp = function(angle, callback) {
    initializeSocket(this.setFaceUp, angle, callback);

    if (angle > 15) {
      angle = 15;
    } else if (angle < -15) {
      angle = -15;
    }

    blockWait(SET_UP, angle, callback);
    faceY = 90 + Number(angle);
    socket.send("@y" + faceY);
  };

  ext.turnFaceDown = function(angle, callback) {
    initializeSocket(this.turnFaceDown, angle, callback);

    blockWait(FACE_TURN, angle, callback);
    if (faceY - Number(angle) >= 75 && faceY - Number(angle) <= 105) {
      faceY -= Number(angle);
      socket.send("@y" + faceY);
    }
  };

  ext.setFaceDown = function(angle, callback) {
    initializeSocket(this.setFaceDown, angle, callback);

    if (angle > 15) {
      angle = 15;
    } else if (angle < -15) {
      angle = -15;
    }

    blockWait(SET_DOWN, angle, callback);
    faceY = 90 - Number(angle);
    socket.send("@y" + faceY);
  };

  ext.speech = function(str, callback) {
    initializeSocket(this.speech, str, callback);

    socket.send(str);
    blockWait(SPEECH, str, callback);
  };

  ext.setEyesBrightness = function(n, callback) {
    initializeSocket(this.setEyesBrightness, n, callback);

    if (n > 255) {
      n = 255;
    } else if (n < 0) {
      n = 0;
    }

    socket.send("@z" + n);
    blockWait(EYE, n, callback);
  };

  var paramString = window.location.search.replace(/^\?|\/$/g, '');
  var vars = paramString.split("&");
  var lang = 'ja';
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair.length > 1 && pair[0] == 'lang')
    lang = pair[1];
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
