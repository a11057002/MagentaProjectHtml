JZZ.synth.Tiny.register('Synth');
JZZ.synth.Tiny.register('Web Audio');
var note = new Array("B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"); //音符陣列
var noteColArray = new Array();                                                        //存音符的陣列
var table = document.getElementById("mytable");                                        //拿table
var string = "";
var string2 ="";                                                                       // 存有按的音符
var tools = JZZ().or(report('Cannot start MIDI engine!')).openMidiOut().or(report('Cannot open MIDI Out!')); //MIDI
var player;
var noteArray = new Array();                                                           //drag note所用 目前無用
var noteTotal = 0;                                                                     //音符目前總量
var playing = false;
var smf = new JZZ.MIDI.SMF(1, 96);
var trk0 = new JZZ.MIDI.SMF.MTrk();
var trk1 = new JZZ.MIDI.SMF.MTrk();
var mytrk = [];
var b64, str, uri, myppqn = 96;
var j = 0;
var table = document.getElementById("mytable");
var chordNum = 84;                                                                     //鍵盤音符數量
var tempnote;

var dragControl = 0;
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
var playHead = document.getElementById("playHead");

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
  for (i = 0; i < chordNum; i++) { //音符數量
    if ((i % 12 == 1) || (i % 12 == 3) || (i % 12 == 5) || (i % 12 == 8) || (i % 12 == 10))
      color = "black";
    else
      color = "white";
    noteTable.innerHTML += "<tr  id=" + (95 - i) + " onmousedown='playnote(this.id)'; onmouseup='stopnote(this.id)';><th class='" + color + "'>" + note[i % 12] + count + "</th></tr>"; //C3->60 D3->61
    table.innerHTML += "<tr class='tt' name='" + (95 - i) + "'><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
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
  $(".tt").append("<td id='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>");
  $('.tt td').off('mousedown');
  start();
}

function clickcontrol() { //增加按下音符動作
  var col = table.rows[0].cells.length;
  $('.tt td').on('mousedown', function(event)
  {
    if(event.which == 1)
    {
        dragControl = 1;
        playnote($(this).parent().attr("name"));
        tempnote = $(this).parent().attr("name");
        console.log(tempnote);
        if (col - $(this).index() < 16)
        {
          var temp = table.rows[0].cells.length;
          add();
          col = table.rows[0].cells.length;
          var i = 0;
          while (i < 16)
          {
            var j = 0;
            noteColArray[i + temp] = new Array();
            while (j < table.rows.length)
            {
              noteColArray[i + temp][j] = new Array();
              j++;
            }
            i++;
          }
        }
        return false;
    }
  });


  $('.tt td').on('mousemove',function(event)    //滑鼠拖曳
  {
    if(event.which == 1 && dragControl)
    {
      // dragControl = false;
      // $(this).addClass('hover');
      if($(this).parent().attr("name") != tempnote)
      {
        console.log(tempnote);
        stopnote(tempnote);
        playnote($(this).parent().attr("name"));
        tempnote = $(this).parent().attr("name");
      }
      if(dragControl == 1)
      {
        $(this).removeClass("highlighted");
        dragControl = 2;
      }

      var number = -$(this).parent().attr("name") + 95;
      noteColArray[$(this).index()][number] = new Array(); //將音符刪除array
    }
  });

  $('.tt td').on('mouseover',function(event)    //滑鼠進
  {
    if(dragControl)
      $(this).addClass('hover');
  });

  $('.tt td').on('mouseout',function(event)    //滑鼠出
  {
    if(dragControl)
      $(this).removeClass('hover');
  });


  $('.tt td').on('mouseup',function(event)    //滑鼠上
  {
    if(dragControl)
      $(this).removeClass('hover');
  });

  $('.tt td').on('contextmenu',function()    //滑鼠右鍵
  {
    $(this).removeClass("highlighted");
    // $(this).removeClass('hover');
    var number = -$(this).parent().attr("name") + 95;
    noteColArray[$(this).index()][number] = new Array(); //將音符刪除array
    return false;
  });

  $('.tt td').on('mouseup', function(event) {
    if (tempnote)
      stopnote(tempnote);

    if(event.which == 1)
    {
      dragControl = 0;
      $(this).addClass("highlighted");
      var number = -$(this).parent().attr("name") + 95;
      noteColArray[$(this).index()][number] = ".note(" + $(this).parent().attr("name") + ",64,24)"; //將音符加入array    note,velocity,clock
    }
  });
}

function addnote()  //增加音符
{
  var i = 0;
  string = "trk1.smfSeqName('Music').ch(0).program(0x00).tick(24)";
  $.each(table.rows[0].cells, function()
  {
    var j = 0;
    if (i != 0)
      string += ".tick(24)";
    $.each(table.rows, function()
    {
      string += noteColArray[i][j];
      j++;
    });

    i++;
  });
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
  trk0.smfBPM(val); //speed
  console.log(smf.toString());

  $('#script0').remove();
  $("body").append("<script id='script0'>" + string + ".tick(24).smfEndOfTrack();</script\>");
  // console.log(string2);

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
  addnote();
  createSMF();
  load(JZZ.lib.fromBase64(b64), 'Base64 data');
  console.log(JZZ.lib.fromBase64(b64));
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
  clear();                                                                //清除正在播放
  createTable();
  $.each($(".highlighted"), function(index) {                             //重劃table
    $(this)[0].className = "";
  });
  var mysmf = new JZZ.MIDI.SMF(data);                                     //建立新的SMF  放data進入
  mytrk = [];
  string = "";
  string2 = "";
  myppqn = mysmf.ppqn;                                                    //把現在ppqn存在全域變數
  var myNewsmf = new JZZ.MIDI.SMF(1, mysmf.ppqn);                         //建立一個空的smf
  var i = 0;                                                              //track數量
  var mysmfTick = 0;                                                      //存目前到第幾個tick
  $("input[name='BPM_val']").val(mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1]);     //將BPM放入左上
  $.each(mysmf, function() {                                                                                                  //對每個track做動作
    mytrk[i] = new JZZ.MIDI.SMF.MTrk();                                                                                       //根據track個數push
    myNewsmf.push(mytrk[i]);
    var smfSplitString = mysmf[i].toString().split("\n");                                                                     //將每個動作切開
    var mysmfNewString = "trk" + i + ".smfSeqName('Music').ch(0).program(0x00).tick(96)";
    var j = 0;                                                                                                                //紀錄每個track 音符數
    $.each(smfSplitString, function() {                                                                                       //對每個動作分析
      var ticktemp = smfSplitString[j].substring(2, smfSplitString[j].indexOf(":"));                                          //存目前tick

      if (mysmfTick != ticktemp && !isNaN(ticktemp)) {                                                                        //當目前tick不等於這個音符之tick   tick是否為數字
        mysmfNewString += ".tick(" + (ticktemp - mysmfTick) + ")";                                                            //tick為後一個tick減前一個
        mysmfTick = ticktemp;                                                                                                 //現在tick等於後來tick
      }
      if (smfSplitString[j].substring(smfSplitString[j].indexOf("--") + 3, smfSplitString[j].indexOf("--") + 10) === "Note On") {                                     //當指令note on
        var note = parseInt(smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[1], 16);
        mysmfNewString += ".noteOn(" + note + ",64)";                                                                                                                 //依據中間三個數值的第一個數值 將16進位轉10進位 音量設為64
        if ((-note + 95) > -1) {          //音符不得<0
          try {                                                                                                                                                       //判斷格子數是否充足
            document.getElementsByName(note)[0].children[parseInt(mysmfTick / (24 * (myppqn / 96)))].className = "highlighted";
            noteColArray[parseInt(mysmfTick / (24 * (myppqn / 96)))][-note + 95] = ".note(" + note + ",64,24)";

          } catch (e) {
            importAddArray();
          } finally {
            document.getElementsByName(note)[0].children[parseInt(mysmfTick / (24 * (myppqn / 96)))].className = "highlighted";
            noteColArray[parseInt(mysmfTick / (24 * (myppqn / 96)))][-note + 95] = ".note(" + note + ",64,24)";
          }
        }
      } else if (smfSplitString[j].substring(smfSplitString[j].indexOf("--") + 3, smfSplitString[j].indexOf("--") + 11) === "Note Off") {                               //當指令為note off
        mysmfNewString += ".noteOff(" + parseInt(smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[1], 16) + ")";
      } else if (smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[0] == "ff51") {                         //當指令為ff51（16進位）時  加入bpm數值
        mysmfNewString += ".smfBPM(" + mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1] + ")";
      }
      j++;
      console.log(j);
      if (j == 4000)
        return false;
    });
    i++;

    mysmfNewString += ".tick(96).smfEndOfTrack();\n"; //每個track最後停止指令
    string2 += mysmfNewString;                         //存入全域變數
    mysmfTick = 0;                                    //重設 讓下一個track用
  });
}

function importAddArray() {
  var temp = table.rows[0].cells.length;
  col = table.rows[0].cells.length;
  var ii = 0;
  while (ii < 16) {
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


function run() {
  val = document.getElementsByName("BPM_val")[0].value;
  var id = setInterval(frame, (60 / val) * 250);
  playnotebtn.disabled = true;
  pausenotebtn.disabled = false;
  rerunnotebtn.disabled = false;

  function frame() {
    pausenotebtn.addEventListener("click", function() {
      clearInterval(id);
      pausenotebtn.disabled = true;
      playnotebtn.disabled = false;
    });
    rerunnotebtn.addEventListener("click", function() {
      var temp = j - 1;
      clearInterval(id);
      for (var i = 0; i < chordNum; i++) {
        table.rows[i].cells[temp].removeAttribute('style');
      }
      j = 0;
      playnotebtn.disabled = false;
      pausenotebtn.disabled = true;
      rerunnotebtn.disabled = true;
    });

    if (j < table.rows[0].cells.length) {
      if (j != 0) {
        for (var k = 0; k < chordNum; k++) {
          table.rows[k].cells[j - 1].removeAttribute('style');
        }
      }
      for (var i = 0; i < chordNum; i++) {
        table.rows[i].cells[j].style.borderRightColor = 'red';
      }
      j++;
    } else {
      clearInterval(id);
      for (var k = 0; k < chordNum; k++) {
        table.rows[k].cells[table.rows[0].cells.length - 1].removeAttribute('style');
      }
      j = 0;
      playnotebtn.disabled = false;
      pausenotebtn.disabled = true;
      rerunnotebtn.disabled = true;
    }
  }
}

$(function() {
  $(window).resize(function() {
    clientWidth = document.body.clientWidth;
  }).resize();
})
