JZZ.synth.Tiny.register('Synth');
JZZ.synth.Tiny.register('Web Audio');
var note = new Array("B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"); //音符陣列
var noteColArray = new Array();
var table = document.getElementById("mytable");
var string = "";
var tools = JZZ().or(report('Cannot start MIDI engine!')).openMidiOut().or(report('Cannot open MIDI Out!'));
var player;
var noteArray = new Array();
var noteTotal = 0;
var playing = false;
var smf = new JZZ.MIDI.SMF(1, 96);
var trk0 = new JZZ.MIDI.SMF.MTrk();
var trk1 = new JZZ.MIDI.SMF.MTrk();
var b64, str, uri, count = 0;
var table = document.getElementById("mytable");
var dragNote = function(alphabet, power, length) {
  this.alphbet = alphabet;
  this.length = length;
  this.power = power;
}
var playnotebtn = document.getElementById("btn");
var pausenotebtn = document.getElementById("btn2");
var rerunnotebtn = document.getElementById("btn3");

var val;
pausenotebtn.disabled = true;
rerunnotebtn.disabled = true;
var port = JZZ().openMidiOut().or(function() {
  alert('Cannot open MIDI port!');
});

var clientWidth = document.body.clientWidth; //取得螢幕寬度
console.log(clientWidth);
var playHead = document.getElementById("playHead");
var pos = getPositionX(playHead) / clientWidth * 100;
console.log(pos);

function playnote(id) //播放單音
{
  port.send([0x90, id, 60]);
}


function stopnote(id) //停止單音
{
  port.send([0x80, id, 0]);
}

function createTable() //製作table
{
  var noteTable = document.getElementById("mynote");
  var row = table.rows.length;
  var i, color, count = 7;
  var noteString = "";
  for (i = 0; i < 60; i++) {
    if ((i % 12 == 1) || (i % 12 == 3) || (i % 12 == 5) || (i % 12 == 8) || (i % 12 == 10))
      color = "black";
    else
      color = "white";
    noteTable.innerHTML += "<tr  id=" + (95 - i) + " onmousedown='playnote(this.id)'; onmouseup='stopnote(this.id)';><th class='" + color + "'>" + note[i % 12] + count + "</th></tr>"; //C3->60 D3->61
    table.innerHTML += "<tr class='tt' name='" + (95 - i) + "'><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
    if (i % 12 == 0) count--;
  }

  var i = 0;
  $.each(table.rows[0].cells, function() {
    var j = 0
    noteColArray[i] = new Array();
    $.each(table.rows, function() {
      noteColArray[i][j] = new Array();
      j++;
    });
    i++;
  });
  console.log(noteColArray);

  start();
}


function start() //開始設置  觸發點擊事件
{
  clickcontrol();
}

function add() //增加表格
{
  $(".tt").append("<td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>");
  $('.tt td').off('mousedown');
  start();
}

function clickcontrol() {
  var col = table.rows[0].cells.length;
  var tempnote;
  $('.tt td').on('mousedown', function() {
    playnote($(this).parent().attr("name"));
    tempnote = $(this).parent().attr("name");
    if (col - $(this).index() < 8) {
      var temp = table.rows[0].cells.length;
      add();
      col = table.rows[0].cells.length;
      var i = 0;
      while (i < 8) {
        var j = 0;
        noteColArray[i + temp] = new Array();
        while (j < table.rows.length) {
          noteColArray[i + temp][j] = new Array();
          j++;
        }
        //console.log(noteColArray);
        i++;
      }
    }
    if ($(this).attr('class') == "highlighted") {
      $(this).removeClass("highlighted");
      $(this).removeAttr('draggable', 'false');
      var number = -$(this).parent().attr("name") + 95;
      noteColArray[$(this).index()][number] = new Array(); //將音符刪除array
    } else {
      noteArray[noteTotal] = new dragNote($(this).parent().attr("name"), 100, 50);
      console.log(noteArray);
      noteTotal++;
      $(this).addClass("highlighted");
      $(this).attr('draggable', 'true');
      var number = -$(this).parent().attr("name") + 95;
      noteColArray[$(this).index()][number] = ".note(" + $(this).parent().attr("name") + ",96,100)"; //將音符加入array
    }

    addnote();
    return false;
  });
  $('.tt td').on('mouseup', function() {
    stopnote(tempnote);
  });
}

function addnote() {
  var i = 0;
  string = "trk1.smfSeqName('Music').ch(0).program(0x00)";
  $.each(table.rows[0].cells, function() {
    var j = 0;
    if (i != 0)
      string += ".tick(96)";
    $.each(table.rows, function() {
      string += noteColArray[i][j];
      j++;
    });

    i++;
  });
  console.log(string);
  console.log(noteColArray);

}

function report(s) //錯誤呼叫
{
  return function() {};
}


function createSMF() //建立音樂
{
  smf = new JZZ.MIDI.SMF(1, 96);
  trk0 = new JZZ.MIDI.SMF.MTrk();
  trk1 = new JZZ.MIDI.SMF.MTrk();
  smf.push(trk0);
  smf.push(trk1);
  val = document.getElementsByName("BPM_val")[0].value;
  trk0.smfBPM(val * 4); //speed

  if (count == 0) {
    $('#script0').remove();
    $("body").append("<script id='script1'>" + string + ".tick(96).smfEndOfTrack();</script\>");
    count = 1;
  } else {
    $('#script1').remove();
    $("body").append("<script id='script0'>" + string + ".tick(96).smfEndOfTrack();</script\>");
    count = 0;
  }

  /*******trk0.smfBPM(120);*/ ////////////
  // console.log(smf);
  var smftemp = smf;
  str = smftemp.dump(); // MIDI file dumped as a string

  b64 = JZZ.lib.toBase64(str); // convert to base-64 string
  console.log(smftemp);
  console.log("str= " + str);
  console.log(str.length);
  console.log(b64);
}

function clear() //清除目前
{
  if (player) player.stop();
  playing = false;
}

function load(data, name) //播放偵測
{
  try {
    player = JZZ.MIDI.SMF(data).player();
    player.connect(tools);
    // console.log(tools);
    player.onEnd = function() {
      playing = false;
      playnotebtn.innerHTML = "Play";
    }
    playing = true;
    player.play();

  } catch (e) {
    console.log(e);
  }
}

function playRerun() //停止播放
{
  player.stop();
  playing = false;
  playnotebtn.innerHTML = "Play";
  playnotebtn.setAttribute("onclick", "fromBase64()");
}

function playPause() {
  player.pause();
  playing = false;
  playnotebtn.setAttribute("onclick", "continuePlay()");
}

function continuePlay() {

  player.resume();
  player.onEnd = function() {
    playing = false;
    playnotebtn.innerHTML = "Play";
  }
  run();
}

function fromBase64() //轉為b64格式
{
  run();
  clear();
  createSMF();
  load(JZZ.lib.fromBase64(b64), 'Base64 data');
  console.log(JZZ.lib.fromBase64(b64));
}

function dragNote() {
  // console.log("dragStart");
}

function exportMidi() {
  var uri = 'data:audio/midi;base64,' + b64;
  console.log(b64);
  location.href = uri;
}


/*
  進度條
  */
function run() {
  val = document.getElementsByName("BPM_val")[0].value;
  var id = setInterval(frame, 10);
  playHead.style.display = "block";
  playnotebtn.disabled = true;
  pausenotebtn.disabled = false;
  rerunnotebtn.disabled = false;

  function frame() {
    pausenotebtn.addEventListener("click", function() {
      clearInterval(id);
      playHead.style.marginLeft = pos + "px";
      pausenotebtn.disabled = true;
      playnotebtn.disabled = false;
    });
    rerunnotebtn.addEventListener("click", function() {
      clearInterval(id);
      pos = 0;
      playHead.style.marginLeft = pos + "px";
      playHead.style.display = "none";
      playnotebtn.disabled = false;
      pausenotebtn.disabled = true;
      rerunnotebtn.disabled = true;
    });
    if (pos >= clientWidth) {

      clearInterval(id);
      pos = 0;
      playHead.style.marginLeft = pos + "px";
      playHead.style.display = "none";
      playnotebtn.disabled = false;
      pausenotebtn.disabled = true;
    } else if (pausenotebtn.disabled == false) {
      playHead.style.marginLeft = pos + "px";
      pos += (47 / 100) * val / 60 * 4;; //(47/100)*val/60*4;
      // console.log(pos+"px");
    }
  }
}

function getPositionX(element) {
  var x = 0;
  while (element) {
    x += element.offsetLeft - element.scrollLeft + element.clientLeft;
    element = element.offsetParent;
  }
  return x;
}



$(function() {
  $(window).resize(function() {
    clientWidth = document.body.clientWidth;
    // console.log(clientWidth);
  }).resize();
})