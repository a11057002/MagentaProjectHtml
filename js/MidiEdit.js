
JZZ.synth.Tiny.register('Synth');
JZZ.synth.Tiny.register('Web Audio');
var note = new Array("B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"); //音符陣列
// var noteColArray = new `Array`();                                                        //存音符的陣列
var table = document.getElementById("mytable");                                        //拿table
var string = "";                                                                     // 存有按的音符
var string2 = "";
var tools = JZZ().or(report('Cannot start MIDI engine!')).openMidiOut().or(report('Cannot open MIDI Out!')); //MIDI
var player;
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
var dragSource;
var playnotebtn = document.getElementById("btn");
var pausenotebtn = document.getElementById("btn2");
var rerunnotebtn = document.getElementById("btn3");
var clearnotebtn = document.getElementById("btn4");
var progessbar = document.getElementById('progessbar');
var tablett = document.getElementsByClassName('tt');
var positiondata;       // drag previous tick data
var previousevent;      // drag previous event
var val;   //bpm value
var cursorX;
var resizeNote = false;
var tempwidth,newWidth;
var tablenode = "<td class ='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";


pausenotebtn.disabled = true;
rerunnotebtn.disabled = true;
clearnotebtn.disabled = false;

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
    table.innerHTML += "<tr class='tt' name='" + (95 - i) + "'><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
    if (i % 12 == 0) count--;
  }
  start();
}


function start() //開始設置  觸發點擊事件
{
  clickcontrol();
}

function addtable() //增加表格
{
  for(var i= 0; i <chordNum ; i++)
  {
    tablett[i].innerHTML+=tablenode + tablenode;
  }
  // $('.tt td').off('mousedown');
}

function dragStart(event) {
  console.log(event);
  previousevent = event;
  positiondata = event.target.innerHTML.split(" ")[1];
  event.target.style.backgroundColor='rgba(60,0,220,0.5)';
  event.target.style.cursor='grabbing';
}

function allowDrop(event) {
  event.preventDefault();                                     //防止元素不給drop  取消默認值

}

function drop(event) {
  if(event.target.tagName != "TD")
  {
    previousevent.target.style.backgroundColor = 'rgba(60,0,220,1)';
  }
  else
  {
    event.preventDefault();
    try{
         previousevent.path[0].outerHTML = "";                      //原本位置清除
       }
    catch(e){}
    // console.log(event.path[1].attributes[1].nodeValue);         //新位置note
    // console.log(positiondata);                                  //原本tick
    previousevent.target.style.cursor='grab';                   //更改鼠標樣式
    event.target.innerHTML = "<div style='width:" + ((positiondata/24*40) + (positiondata/24-1)*7) + "px' class='createnote' ondragstart = 'dragStart(event)' draggable='true' >.note(" + event.path[1].attributes[1].nodeValue + ",64, "+ positiondata +" )</div>";
  }
  stopnote(tempnote);
}


function clickcontrol() { //增加按下音符動作
  var col = table.rows[0].cells.length;

  $('.tt td').attr('ondrop','drop(event)');
  $('.tt td').attr('ondragover','allowDrop(event)');
  $('body').attr('ondrop','drop(event)');
  $('body').attr('ondragover','allowDrop(event)');

  $('.tt td').on('mousedown', function(event)
  {
    if(event.which == 1)
    {

        playnote($(this).parent().attr("name"));
        tempnote = $(this).parent().attr("name");
        if($(this).html() == "")
          $(this).html("<div class='createnote'  ondragstart = 'dragStart(event)' draggable='true' >.note(" + $(this).parent().attr('name') + ",64, 24 )</div>");  //24  tick旁邊有空白方便切割
        // console.log($(this).html());
        // console.log(tempnote);
        if (col - $(this).index() < 16)
        {
          addtable();
          start();
        }
        if(resizeNote)
        {
          noteToResize = $(this).children();
          noteWidth = $(this).children().width();
          cursorX = event.clientX;
        }
    }
  });

  $('.tt td').on('mousemove',function(event)    //滑鼠拖曳
  {
    if(event.which == 1)
    {
      if($(this).parent().attr("name") != tempnote)
      {
        console.log(tempnote);
        stopnote(tempnote);
        playnote($(this).parent().attr("name"));
        tempnote = $(this).parent().attr("name");
      }

      if(resizeNote)
        {
          // console.log(event.offsetX);
          // console.log(event.clientX);
          // $(this).children().css('z-index', '-2');
          tempwidth = noteWidth + (event.clientX -cursorX);
          // console.log(tempwidth);
          noteToResize.css('width',  tempwidth + 'px');
        }
    }
    // console.log(event);
    // console.log($(this).offset());
    // console.log(event.offsetX);

    if(event.target.className == "createnote")
    {
        // if(event.offsetX <10 && event.offsetX > -1)
        // {
        //   $(this).children().css('cursor','w-resize');
        //   $(this).children().attr('draggable','false');
        //   resizeNote = true;
        // }
        if (event.offsetX <= event.target.clientWidth && event.offsetX > event.target.clientWidth-10) {
          $(this).children().css('cursor','e-resize');
          $(this).children().attr('draggable','false');

          resizeNote = true;
        }
        else {
          $(this).children().css('cursor','grab');
          $(this).children().attr('draggable','true');
          resizeNote = false;
        }
    }

  });

  $('.tt td').on('mouseup', function(event) {
    if (tempnote)
      stopnote(tempnote);

    if(resizeNote)
    {
      newWidth = (parseInt(tempwidth/46)+1)*40 + (parseInt(tempwidth/46))*7;
      newTick = (parseInt(tempwidth/46)+1)*24;
      noteToResize.css('width',  newWidth + 'px');
      noteToResize.html(".note(" + $(this).parent().attr('name') + ",64, "+ newTick +" )");  //24  tick旁邊有空白方便切割
      noteToResize = '';
      tempwidth = 0;
      newWidth = 0;
    }
  });

  $('.tt td').on('contextmenu',function()
  {
    $(this).html("");
    $(this).css('cursor','');
    return false;
  });
}

function addnote()  //增加音符
{
  var i = 0;
  var j = 0;
  var allTickPrevious=0;
  var lengthOfString;
  string = "trk1.smfSeqName('Music').ch(0).program(0x00)";
  string2 = "trk2.smfSeqName('Music').ch(0).program(0x00)";

    $.each(table.rows[0].cells, function()    //每一行
    {
        allTickPrevious+=24;

        lengthOfString = string.length;


        if(lengthOfString > 40000)
        {
          if(string2 == "trk2.smfSeqName('Music').ch(0).program(0x00)")
          {
            console.log(allTickPrevious);
            string2 += ".tick(" + allTickPrevious + ")";
          }
          string2 += ".tick(24)";
        }
        else {
          string += ".tick(24)";
        }

      for(;i<chordNum;i++)
      {
        if(lengthOfString > 40000)
        {
          string2 += table.children[i].children[0].children[j].innerText;
        }
        else
        {
            string += table.children[i].children[0].children[j].innerText;
        }
      }
      j++;
      i=0;
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
  trk2 = new JZZ.MIDI.SMF.MTrk();
  smf.push(trk0);
  smf.push(trk1);
  smf.push(trk2);
  val = document.getElementsByName("BPM_val")[0].value;
  trk0.smfBPM(val); //speed
  console.log(smf.toString());

  $('#script0').remove();
  $('#script1').remove();
  $("body").append("<script id='script0'>" + string + ".tick(24).smfEndOfTrack();</script\>");
  $("body").append("<script id='script1'>" + string2 + ".tick(24).smfEndOfTrack();</script\>");
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

function playStop() //停止播放
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
  var inputNoteString;
  mytrk = [];
  string = "";
  myppqn = mysmf.ppqn;                                                    //把現在ppqn存在全域變數
  var i = 0;                                                              //track數量
  var mysmfTick = 0;                                                      //存目前到第幾個tick

  $("input[name='BPM_val']").val(mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1]);     //將BPM放入左上
  $.each(mysmf, function() {                                                                                                  //對每個track做動作
    mytrk[i] = new JZZ.MIDI.SMF.MTrk();                                                                                       //根據track個數push

    var smfSplitString = mysmf[i].toString().split("\n");                                                                     //將每個動作切開
    var j = 0;
    var ticktemp = "";
    var note = "";
    inputNoteString = new Array(84);
                                                                           //紀錄每個track 音符數
      $.each(smfSplitString, function() {                                                                                       //對每個動作分析
      ticktemp = smfSplitString[j].substring(2, smfSplitString[j].indexOf(":"));                                          //存目前tick

      if (mysmfTick != ticktemp && !isNaN(ticktemp)) {                                                                        //當目前tick不等於這個音符之tick   tick是否為數字
        mysmfTick = ticktemp;                                                                                                 //現在tick等於後來tick
      }

      var mySplitString = smfSplitString[j].substring(smfSplitString[j].indexOf("--") + 3, smfSplitString[j].indexOf("--") + 10);
      note = parseInt(smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[1], 16);

      if (mySplitString === "Note On") {                                     //當指令note on
        inputNoteString[note] = mysmfTick;
      } else if (mySplitString === "Note Of") {                               //當指令為note off
        var calculateTick = parseInt((mysmfTick-inputNoteString[note])/(24*myppqn/96));
        var addNoteString = "<div class='createnote' ondragstart = 'dragStart(event)' draggable='true' >.note(" + note + ",64, "+ parseInt(24*calculateTick) +" )</div>";                                                                                                                 //依據中間三個數值的第一個數值 將16進位轉10進位 音量設為64

        if ((-note + 95) > -1) {          //音符不得<0
          try {
          document.getElementsByName(note)[0].children[parseInt(inputNoteString[note] / (24 * (myppqn / 96)))].innerHTML = addNoteString;   //判斷格子數是否充足
          } catch (e) {
            addtable();
          }
            try{
              document.getElementsByName(note)[0].children[parseInt(inputNoteString[note] / (24 * (myppqn / 96)))].innerHTML = addNoteString;
            }
            catch(e)
            {
              addtable();
            }
            finally
            {
              document.getElementsByName(note)[0].children[parseInt(inputNoteString[note] / (24 * (myppqn / 96)))].innerHTML = addNoteString;
              document.getElementsByName(note)[0].children[parseInt(inputNoteString[note] / (24 * (myppqn / 96)))].children[0].style.width = 40*calculateTick + 7*(calculateTick-1);
            }
        }
      }
      console.log(j+"/" + smfSplitString.length);
      // progessbar.innerText = j +  "/" +smfSplitString.length;
      // console.log(smfSplitString[j]);
      j++;
      // if (j == 6000)
      //   return false;
    });
    i++;
    mysmfTick = 0;                                    //重設 讓下一個track用
    // load(mysmf.dump(),'base');
  });
  console.log(inputNoteString);
  start();
   // alert("Finish input");
}


function run() {
  val = document.getElementsByName("BPM_val")[0].value;
  var id = setInterval(frame, (60 / val) * 250);
  playnotebtn.disabled = true;
  pausenotebtn.disabled = false;
  rerunnotebtn.disabled = false;
  clearnotebtn.disabled = true;

  function frame() {
    pausenotebtn.addEventListener("click", function() {
      clearInterval(id);
      pausenotebtn.disabled = true;
      playnotebtn.disabled = false;
      clearnotebtn.disabled = true;
    });
    rerunnotebtn.addEventListener("click", function() {
      var temp = j - 1;
      clearInterval(id);
      for (var i = 0; i < chordNum; i++) {
        table.rows[i].cells[temp].removeAttribute('style');
      }
      j = 0;
      playnotebtn.disabled = false;
      clearnotebtn.disabled = false;
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
      clearnotebtn.disabled = false;
      pausenotebtn.disabled = true;
      rerunnotebtn.disabled = true;
    }
  }
}

$(function() {
  $(window).resize(function() {
    clientWidth = document.body.clientWidth;
  }).resize();
  $('#btn4').on('click',function(){
    clear();
    createTable();
    if(player)
      playStop();
  });

});
