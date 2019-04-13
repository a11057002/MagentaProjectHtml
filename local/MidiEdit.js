JZZ.synth.Tiny.register('Synth');
JZZ.synth.Tiny.register('Web Audio');
var note = new Array("B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"); //音符陣列
var noteColArray = new Array();
var table = document.getElementById("mytable");
var string = "";
var tools = JZZ().or(report('Cannot start MIDI engine!')).openMidiOut().or(report('Cannot open MIDI Out!'));
var player;
var playing = false;
var smf = new JZZ.MIDI.SMF(1, 96);
var trk0 = new JZZ.MIDI.SMF.MTrk();
var trk1 = new JZZ.MIDI.SMF.MTrk();
var b64, str, uri, count = 0;
var table = document.getElementById("mytable");

var port = JZZ().openMidiOut().or(function() {
  alert('Cannot open MIDI port!');
});


function playnote(id)    //播放單音
{ 
  port.send([0x90, id, 100]);
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
    noteTable.innerHTML += "<tr  id=" + (95 - i) + " onmousedown='playnote(this.id)'; onmouseup='stopnote(this.id)';><th class='" + color + "'>" + note[i % 12] + count + "</th></tr>";
    table.innerHTML += "<tr class='tt' name='" + (95 - i) + "'><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
    if (i % 12 == 0) count--;
  }

  var i = 0;
  $.each(table.rows[0].cells, function() {
    var j = 0
      noteColArray[i] = new Array();
     $.each(table.rows, function()
     {
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
  $(".tt").append("<td></td><td></td><td></td><td></td>");
  $('.tt td').off('mousedown');
  start();
}

function clickcontrol()
{
   var col = table.rows[0].cells.length;
   var tempnote;
  $('.tt td').on('mousedown', function() {
    playnote($(this).parent().attr("name"));
    tempnote = $(this).parent().attr("name");
    if (col - $(this).index() <= 4) {
      var temp = table.rows[0].cells.length;
      add();
      col = table.rows[0].cells.length;
      var i = 0;
      while (i < 4) 
      {
        var j=0;
        noteColArray[i + temp] = new Array();
        while(j < table.rows.length)
        {
          noteColArray[i + temp][j] = new Array();
          j++;
        }
        // console.log(noteColArray);
        i++;
      }
    }
    if ($(this).attr('class') == "highlighted") {
      $(this).removeClass("highlighted"); 
      var number = -$(this).parent().attr("name") + 95;
       noteColArray[$(this).index()][number] = new Array(); //將音符刪除array
    } else {
      $(this).addClass("highlighted");
      var number = -$(this).parent().attr("name") + 95;
       noteColArray[$(this).index()][number] = ".note(" + $(this).parent().attr("name") + ",100,50)"; //將音符加入array
    }

    addnote();
    return false;
  });
  $('.tt td').on('mouseup', function() {
    stopnote(tempnote);
  });
}

function addnote()
{
    var i = 0;
    string = "trk1.smfSeqName('Music').ch(0).program(0x00)";
    $.each(table.rows[0].cells, function() {
      var j=0;
      string += ".tick(100)";
      $.each(table.rows, function()
       {
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
  trk0.smfBPM(120);

  if (count == 0) {
    $('#script0').remove();
    $("body").append("<script id='script1'>" + string + ".tick(100).smfEndOfTrack();</script\>");
    count = 1;
  } else {
    $('#script1').remove();
    $("body").append("<script id='script0'>" + string + ".tick(100).smfEndOfTrack();</script\>");
    count = 0;
  }
  
  trk0.smfBPM(120);
  console.log(smf);
  var smftemp = smf;
  str = smftemp.dump(); // MIDI file dumped as a string
  b64 = JZZ.lib.toBase64(str); // convert to base-64 string
  console.log(string);
  console.log(str);
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
    console.log(tools);
    player.onEnd = function() {
      playing = false;
    }
    playing = true;
    player.play();
  } catch (e) {
    console.log(e);
  }
}

function playStop() //停止播放
{ 
  player.stop();
  playing = false;
}

function fromBase64() //轉為b64格式
{ 

  clear();
  createSMF();
  load(JZZ.lib.fromBase64(b64), 'Base64 data');
}