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
var mytrk = [];
var b64, str, uri,myppqn=96;
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
// console.log(clientWidth);
var playHead = document.getElementById("playHead");
var pos = getPositionX(playHead) / clientWidth * 100;
// console.log(pos);

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
  noteTable.innerHTML = "";
  table.innerHTML = "";
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
  // console.log(noteColArray);

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

function clickcontrol() { //增加按下音符動作
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
      // noteArray[noteTotal] = new dragNote($(this).parent().attr("name"), 100, 50);
      // console.log(noteArray);
      // noteTotal++;
      $(this).addClass("highlighted");
      $(this).attr('draggable', 'true');
      var number = -$(this).parent().attr("name") + 95;
      noteColArray[$(this).index()][number] = ".note(" + $(this).parent().attr("name") + ",64,24)"; //將音符加入array    note,velocity,clock
      console.log(number);
    }

    addnote();
    return false;
  });
  $('.tt td').on('mouseup', function() {
    if (tempnote)
      stopnote(tempnote);
  });
}

function addnote() { //增加音符
  var i = 0;
  string = "trk1.smfSeqName('Music').ch(0).program(0x00)";
  $.each(table.rows[0].cells, function() {
    var j = 0;
    if (i != 0)
      string += ".tick(24)";
    $.each(table.rows, function() {
      string += noteColArray[i][j];
      j++;
    });

    i++;
  });
  // console.log(string);
  // console.log(noteColArray);

}

function report(s) //錯誤呼叫
{
  return function() {};
}


function createSMF() //建立音樂
{
  smf = new JZZ.MIDI.SMF(1, myppqn);
  trk0 = new JZZ.MIDI.SMF.MTrk();
  trk1 = new JZZ.MIDI.SMF.MTrk();
  smf.push(trk0);
  smf.push(trk1);
  val = document.getElementsByName("BPM_val")[0].value;
  trk0.smfBPM(val); //speed
  console.log(smf.toString());
  console.log(smf.toString());

  $('#script0').remove();
  $("body").append("<script id='script0'>" + string + ".tick(24).smfEndOfTrack();</script\>");
  console.log(string);

  var smftemp = smf;
  str = smftemp.dump(); // MIDI file dumped as a string

  b64 = JZZ.lib.toBase64(str); // convert to base-64 string
  console.log(string);
  console.log(smftemp);
  console.log((smftemp[0][0]).dd);
  // console.log("str= " + str);
  // console.log(str.length);
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
    $("#export").removeAttr("disabled");
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
  // console.log(b64);
  location.href = uri;
}

function importMidi() //讀黨
{
  if (window.FileReader) {
    var reader = new FileReader();
    var f = document.getElementById('file').files[0];
    reader.onload = function(e) {
      var data = '';
      var bytes = new Uint8Array(e.target.result);
      for (var i = 0; i < bytes.length; i++) {
        data += String.fromCharCode(bytes[i]);
      }
      createImport(data);
    };
    reader.readAsArrayBuffer(f);
  }
}

function createImport(data) {
  clear(); //清除正在播放
  createTable();
  $.each($(".highlighted"), function(index) {
    $(this)[0].className = "";
  });
  var mysmf = new JZZ.MIDI.SMF(data); //建立新的SMF  放data進入
  mytrk = [];
  string = "";
  console.log(mysmf);
  console.log(mysmf.toString());
  console.log(mysmf.ppqn);
  myppqn = mysmf.ppqn;
  var myNewsmf = new JZZ.MIDI.SMF(1, mysmf.ppqn); //建立一個空的smf
  var i = 0;
  var mysmfTick = 0;
  var myFinalString = "";
  $.each(mysmf, function() { //對每個track做動作
    mytrk[i] = new JZZ.MIDI.SMF.MTrk(); //根據track個數push
    myNewsmf.push(mytrk[i]);
    // console.log(mysmf[i].toString().split("\n"));
    var smfSplitString = mysmf[i].toString().split("\n"); //將每個動作切開
    var mysmfNewString = "mytrk[" + i + "].smfSeqName('Music').ch(0).program(0x00).tick(96)";
    var j = 0;
    var length = 0;
    $.each(smfSplitString, function() { //對每個動作分析
      // console.log(mysmfTick);
      // console.log(length);
      // console.log(smfSplitString[j].substring(smfSplitString[j].indexOf("--") + 3, smfSplitString[j].indexOf("--") + 10));
      if (mysmfTick != smfSplitString[j].substring(2, smfSplitString[j].indexOf(":")) && !isNaN(smfSplitString[j].substring(2, smfSplitString[j].indexOf(":")))) { //當目前tick不等於這個音符之tick   tick是否為數字
        mysmfNewString += ".tick(" + (smfSplitString[j].substring(2, smfSplitString[j].indexOf(":")) - mysmfTick) + ")"; //tick為後一個tick減前一個
        mysmfTick = smfSplitString[j].substring(2, smfSplitString[j].indexOf(":")); //現在tick等於後來tick
        if (length%2==0) {
          var temp = table.rows[0].cells.length;
          col = table.rows[0].cells.length;
          var ii = 0;
          while (ii < 8) {
            var jj = 0;
            noteColArray[ii + temp] = new Array();
            // console.log(table.row.length);
            while (jj < table.rows.length) {
              noteColArray[ii + temp][jj] = new Array();
              jj++;
            }
            ii++;
          }
          add();
        }
        length++;
      }
      if (smfSplitString[j].substring(smfSplitString[j].indexOf("--") + 3, smfSplitString[j].indexOf("--") + 10) === "Note On") { //當指令（轉10進位後）為144時  播放
        var note = parseInt(smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[1], 16);
        mysmfNewString += ".noteOn(" + note + ",64)"; //依據中間三個數值的第一個數值 將16進位轉10進位 音量設為64
        console.log(-parseInt(smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[1], 16) + 95);
        console.log(parseInt(mysmfTick / 24));
        console.log(mysmfTick / 24);
        console.log(document.getElementsByName(note)[0]);
        console.log(document.getElementsByName(note)[0].children[parseInt(mysmfTick / 24)]);
        document.getElementsByName(note)[0].children[parseInt(mysmfTick / 24)].className = "highlighted";
        console.log(-note + 95);
        noteColArray[parseInt(mysmfTick / 24)][-note + 95] = ".note(" + note + ",64,24)";
        // console.log(noteColArray);

      }


      if (smfSplitString[j].substring(smfSplitString[j].indexOf("--") + 3, smfSplitString[j].indexOf("--") + 11) === "Note Off") { //當指令為128（轉10進位後）時 停止
        mysmfNewString += ".noteOff(" + parseInt(smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[1], 16) + ")"; //同上  變noteoff
      }
      if (smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[0] == "ff51") { //當指令為ff51（16進位）時  加入bpm數值
        mysmfNewString += ".smfBPM(" + mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1] + ")";
      }
      j++;
    });
    i++;
    mysmfNewString += ".tick(96).smfEndOfTrack();\n"; //每個track最後停止指令
    // console.log(mysmfNewString);
    string += mysmfNewString;
    mysmfTick = 0;
  $("input[name='BPM_val']").val(mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1]); //將BPM放入左上
  $('#script0').remove();
  $("body").append("<script id='script0'>" + string + "</script\>");
  // console.log(string);
  var mystr = myNewsmf.dump(); // MIDI file dumped as a string
  myb64 = JZZ.lib.toBase64(mystr);
  load(mystr, "");
  addnote();
  });

  // console.log(mysmf[0].toString().split(" "));
  // console.log(mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1]);

  // $("#mytable td")[0]
  // $("input[name='BPM_val']").val(mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1]); //將BPM放入左上
  // $('#script0').remove();
  // $("body").append("<script id='script0'>" + string + "</script\>");
  // // console.log(string);
  // var mystr = myNewsmf.dump(); // MIDI file dumped as a string
  // myb64 = JZZ.lib.toBase64(mystr);
  // // load(mystr, "");
  // addnote();
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