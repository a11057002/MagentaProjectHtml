
JZZ.synth.Tiny.register('Synth');
JZZ.synth.Tiny.register('Web Audio');
var tools = JZZ().or(report('Cannot start MIDI engine!')).openMidiOut().or(report('Cannot open MIDI Out!')); //MIDI
var note = new Array("B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"); //音符陣列
var port = JZZ().openMidiOut().or(function() {alert('Cannot open MIDI port!');});
var table = document.getElementById("mytable");                                        //拿table
var playnotebtn = document.getElementById("btn");
var noteTable = document.getElementById("mynote");
var playHead = document.getElementById("playHead");
var pausenotebtn = document.getElementById("btn2");
var rerunnotebtn = document.getElementById("btn3");
var clearnotebtn = document.getElementById("btn4");
var clearrangebtn = document.getElementById("btn5");
var tablett = document.getElementsByClassName('tt');
var progessbar = document.getElementById('progessbar');
var clientWidth = document.body.clientWidth; //取得螢幕寬度
var smf = new JZZ.MIDI.SMF(1, 96);
var trk = new Array();
var chordNum = 96;                                                                     //鍵盤音符數量
var b64, str, uri, myppqn = 96;
var j = 0;
var tempnote;
var positiondata;       // drag previous tick data
var previousevent;      // drag previous event
var playing = false;
var resizeNote = false;                                                                 //音符目前總量
var whereToStart = 0;
var whereToStop = 0;
var string = "";                                                                     // 存有按的音符
var string2 = "";
var string3 = "";
var tempwidth,newWidth;
var val;   //bpm value
var cursorX;
var player;
var noteToResize;
var noteWidth;
var tablecount = 0;
var resume =false;
var followControl = 0;
var id;
var resumeTick = 0;

pausenotebtn.disabled = true;
rerunnotebtn.disabled = true;
clearnotebtn.disabled = false;

$("#progressbar").hide();
function playnote(id)
{
  /*
    Args:
          id:音符對應之數值
    DO:
          播放id之音符，0x90 為播放指令  $("#velocity").val()為音量大小
  */
  port.send([0x90, id, $("#velocity").val()]);
}


function stopnote(id)
{
  /*
    Args:
          id:音符對應之數值
    DO:
          停止id之音符，0x80 為停止指令  0為音量大小
  */
  port.send([0x80, id, 0]);
}

function createTable()
{
  /*
      DO:
          生成table並給予對應之音符號碼及顏色
          目前總共音符為96音 (ChordNum)
          生成完table後增加ClickEvent (start())
  */
  var row = table.rows.length;
  var i, color, count = 8;
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
    if (note[i % 12] == 'C') count--;
  }
  start();
}


function start()
{
  /*
    DO:
        新增ClickEvent並重設起始及結束位置

  */
  clickcontrol();
  whereToStart = 0;
  whereToStop =  table.rows[0].cells.length-1;
}

function addtable()
{
  /*
    DO:
        增加表格格數
        目前一次增加2小節

  */

  var tablenode = "<td class ='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
  for(var i= 0; i <chordNum ; i++)
  {
    tablett[i].innerHTML+=tablenode + tablenode;
  }
}
function addtable2(count)
{
  /*
    DO:
        增加表格格數
        目前一次增加2小節

  */
  var tablenode = "<td class ='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
  var tablestring="";
  for(var j = 0;j<count;j++)
  {
    tablestring += tablenode + tablenode+ tablenode+ tablenode;
  }
  for(var i= 0; i <chordNum ; i++)
  {
    tablett[i].innerHTML+= tablestring;
  }
}



function dragStart(event)
{
  /*
    Args:
          event:觸發事件
    DO:
          開始拖曳時
          將原本事件儲存下來
          顏色調為半透明
          鼠標格式改為抓取中
  */

  previousevent = event;
  event.target.style.backgroundColor='rgba(60,0,220,0.5)';
  event.target.style.cursor='grabbing';
}

function allowDrop(event)
{
   /*
    Args:
          event:觸發事件
    DO:
          防止元素不給drop  取消默認
   */
  event.preventDefault();
}

function drop(event)
{
  /*
    Args:
          event:觸發事件
    DO:
          當拖曳結束時
          如果不是在TD上 維持原樣
          否則將上個事件之物件放置新位置
  */
  if(event.target.tagName == "TD")
  {
    event.preventDefault();
    try
    {
      previousevent.target.outerHTML = "";
    }
    catch(e)
    {
      console.log(e);
    }
    previousevent.target.style.cursor='grab';
    positiondata = previousevent.target.innerHTML.split(" ")[1];
    event.target.innerHTML = "<div style='width:" + ((positiondata/24*40) + (positiondata/24-1)*6) + "px' class='createnote' ondragstart = 'dragStart(event)' draggable='true' >.note(" + event.path[1].attributes[1].nodeValue + ",0x60, "+ positiondata +" )</div>";
  }
  stopnote(tempnote);
}

function dragEnd(event)
{
  previousevent.target.style.backgroundColor = 'rgba(60,0,220,1)';
}


function clickcontrol()
{
  /*
    DO:
        增加ClickEvent

        case 編輯音符:
             (當左鍵按下時)
                播放對應音符並儲存至tempnote
                若該格為空增加音符物件
                當該格為當前最後一小節則增加小節數
                當鼠標為左右拖曳時可改動音符長度
             (當拖曳時)
                更改音符長度
             (當放開時)
                停止播放對應音符
                修改音符長度  24tick為單位
                修改格子長度  46px為單位
             (當右鍵按下時)
                清除該格之物件

      case  選擇範圍:
            (當左鍵按下時)
                決定起始位置
            (當右鍵按下時)
                決定結束位置

  */
  $('.tt td').attr('ondrop','drop(event)');
  $('.tt td').attr('ondragover','allowDrop(event)');
  $('.tt td').attr('ondragend','dragEnd(event)');

  $('.tt td').on('mousedown', function(event)
  {
    if(event.which == 1)
    {
      if($('body').css('cursor')=='pointer')
      {
        if(playing)
           player.jump($(this).index()*24);
        else
        {
            var previousPlaceToStart = whereToStart;
            if(whereToStop > $(this).index())
            {
              whereToStart = $(this).index();
              j=whereToStart;
              for (var i = 0; i < chordNum; i++)
              {
                if(previousPlaceToStart>0)
                table.rows[i].cells[previousPlaceToStart-1].removeAttribute('style');
                if(j!=0)
                table.rows[i].cells[j-1].style.borderRightColor = 'red';
              }
            }
        }
      }
      else
      {
          var col = table.rows[0].cells.length;
          playnote($(this).parent().attr("name"));
          tempnote = $(this).parent().attr("name");

          if($(this).html() == "")
            $(this).html("<div class='createnote'  ondragstart = 'dragStart(event)' draggable='true' >.note(" + $(this).parent().attr('name') + ",0x60, 24 )</div>");  //24  tick旁邊有空白方便切割
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
    }
  });

  $('.tt td').on('mousemove',function(event)    //滑鼠拖曳
  {
    if(event.which == 1 && $('body').css('cursor')!='pointer')
    {
      if($(this).parent().attr("name") != tempnote)
      {
        stopnote(tempnote);
        playnote($(this).parent().attr("name"));
        tempnote = $(this).parent().attr("name");
      }

      if(resizeNote && noteToResize!= undefined && noteToResize != "")
      {
        tempwidth = noteWidth + (event.clientX -cursorX);       //修改長度時 隨時更改
        noteToResize.css('width',  tempwidth + 'px');
      }
    }

    if(event.target.className == "createnote")
    {
      if (event.offsetX <= event.target.clientWidth && event.offsetX > event.target.clientWidth-10)
      {
        $(this).children().css('cursor','e-resize');
        $(this).children().attr('draggable','false');
        resizeNote = true;
      }
      else
      {
        $(this).children().css('cursor','grab');
        $(this).children().attr('draggable','true');
        resizeNote = false;
      }
    }
  });

  $('.tt td').on('mouseup', function(event)
  {

    if (tempnote)
      stopnote(tempnote);

    if(resizeNote && noteToResize!= undefined && noteToResize != "")
    {
      newWidth = (parseInt(tempwidth/46)+1)*40 + (parseInt(tempwidth/46))*6;
      newTick = (parseInt(tempwidth/46)+1)*24;
      noteToResize.css('width',  newWidth + 'px');
      noteToResize.html(".note(" + $(this).parent().attr('name') + ",0x60, "+ newTick +" )");  //24  tick旁邊有空白方便切割
      noteToResize = '';
      tempwidth = 0;
      newWidth = 0;
    }
  });

  $('.tt td').on('contextmenu',function()
  {
    if($('body').css('cursor')=='pointer' && whereToStart < $(this).index())
    {
      for (var i = 0; i < chordNum; i++)
      {
        if(whereToStop<table.rows[0].cells.length)
        table.rows[i].cells[whereToStop].removeAttribute('style');
        table.rows[i].cells[$(this).index()].style.borderRightColor = 'blue';
      }
      whereToStop  = $(this).index();
      return false;
    }
    else
    {
      $(this).html("");
      $(this).css('cursor','');
      return false;
    }
  });
}

function addnote()
{
  /*
    DO:
        將現有音符加入陣列
        一行一行將音符加入 換一行加24tick
        怕overflow儲存至2個變數
  */

  var i = 0;
  var j = 0;
  var allTickPrevious=0;
  var lengthOfString;
  string = "trk[1].smfSeqName('Music').ch(0)";
  string2 = "trk[2].smfSeqName('Music').ch(0)";
  string3 = "trk[3].smfSeqName('Music').ch(0)";
    for(j=whereToStart;j<=whereToStop;j++)
    {
      allTickPrevious+=24;
      lengthOfString = string.length;

      if(string2.length>40000)
      {
         if(string3 == "trk[3].smfSeqName('Music').ch(0)")
        {
          string3 += ".tick(" + allTickPrevious + ")";
        }
        string3 += ".tick(24)";
      }
      else if(lengthOfString > 40000)
      {
        if(string2 == "trk[2].smfSeqName('Music').ch(0)")
        {
          string2 += ".tick(" + allTickPrevious + ")";
        }
        string2 += ".tick(24)";
      }
      else if(j!=whereToStart)
      {
        string += ".tick(24)";
      }

    for(;i<chordNum;i++)
    {
      if(string2.length>40000)
          string3 += table.children[i].children[0].children[j].innerText;
      else if(lengthOfString > 40000)
      {
          string2 += table.children[i].children[0].children[j].innerText;
      }
      else
      {
          string += table.children[i].children[0].children[j].innerText;
      }
    }
    i=0;
    }

 }

function report(s) //錯誤呼叫
{
  return function() {};
}


function createSMF()
{
  /*
    DO:
        製作播放物件
        將每一track壓進smf中
        設置bpm
        將音符script置換(track裡的音符設置)
        將smf打印成字串
        將字串轉為b64格式
  */
  smf = new JZZ.MIDI.SMF(1, 96);
  trk[0] = new JZZ.MIDI.SMF.MTrk();
  trk[1] = new JZZ.MIDI.SMF.MTrk();
  trk[2] = new JZZ.MIDI.SMF.MTrk();
  trk[3] = new JZZ.MIDI.SMF.MTrk();
  smf.push(trk[0]);
  smf.push(trk[1]);
  smf.push(trk[2]);
  smf.push(trk[3]);
  val = document.getElementsByName("BPM_val")[0].value;
  trk[0].smfBPM(val); //speed

  $('#script0').remove();
  $('#script1').remove();
  $('#script2').remove();
  $("body").append("<script id='script0'>" + string + ".smfEndOfTrack();</script\>");       //第一個track音符
  $("body").append("<script id='script1'>" + string2 + ".smfEndOfTrack();</script\>");      //第二個track音符
  $("body").append("<script id='script1'>" + string3 + ".smfEndOfTrack();</script\>");      //第二個track音符
  var smftemp = smf;
  str = smftemp.dump(); // MIDI file dumped as a string
  b64 = JZZ.lib.toBase64(str); // convert to base-64 string
  uri = 'data:audio/midi;base64,' + b64;
}

function clear()
{
  /*
    DO:
        停止目前播放
  */
  if (player) player.stop();
  playing = false;
}

function load(data, name)
{
  /*
    Args:
          Data:音源 打印smf的格式
          name:命名
    DO:
          設置player 將上排工具列連接至player
          player 重複播放設為true
          開始播放
  */
  try
  {
    player = JZZ.MIDI.SMF(data).player();
    player.loop(true);
    player.connect(tools);
    player.onEnd = function()
    {
      playing = false;
      playnotebtn.innerHTML = "Play";
    }
    playing = true;
    player.play();
    $("#export").removeAttr("disabled");
  }
  catch (e)
  {
    console.log(e);
  }
}

function playStop()
{
  /*
    DO:
        播放音樂
  */
  player.stop();
  playing = false;
  playnotebtn.innerHTML = "Play";
  playnotebtn.setAttribute("onclick", "fromBase64()");
      clearInterval(id);
        for (var i = 0; i < chordNum; i++)
        {
           if(whereToStart>0)
              table.rows[i].cells[whereToStart-1].style.borderRightColor = 'red';
           table.rows[i].cells[resumeTick].removeAttribute('style');
        }
      playnotebtn.disabled = false;
      clearnotebtn.disabled = false;
      pausenotebtn.disabled = true;
      rerunnotebtn.disabled = true;
}

function playPause()
{
  /*
    DO:
        暫停播放
  */
  player.pause();
  playing = false;
  playnotebtn.setAttribute("onclick", "continuePlay()");
  clearInterval(id);
  pausenotebtn.disabled = true;
  playnotebtn.disabled = false;
  clearnotebtn.disabled = true;
}

function continuePlay()
{
  /*
    DO:
        繼續播放
  */
  player.resume();
  resume = true;
  player.onEnd = function() {
  playing = false;
  playnotebtn.innerHTML = "Play";
  }
  run(1);
}

function fromBase64() //轉為b64格式
{
  /*
    DO:
        進度調開跑
        停止目前播放
        將現有音符加入字串
        製作音源
        播放音源
  */
  run(0);
  clear();
  addnote();
  createSMF();
  load(JZZ.lib.fromBase64(b64), 'Base64 data');
}

function exportMidi()
{
  /*
    DO:
        匯出
  */
  location.href = uri;
}

function importMidi()
{
  /*
    DO:
        讀取midi黨
  */

  var data;
  if (window.FileReader)
  {
    var reader = new FileReader();
    var f = document.getElementById('file').files[0];
    reader.onload = function(e)
    {
      data = '';
      var bytes = new Uint8Array(e.target.result);
      for (var i = 0; i < bytes.length; i++)
      {
        data += String.fromCharCode(bytes[i]);
      }
      var changeText = function(){
          return new Promise(function(resolve,reject){
            $("#progressbar").show();
            $("#progressbar").html('匯入中...(資料量:'+ JZZ.MIDI.SMF(data).toString().length +')');
            setTimeout(function(){
              resolve();
            },10)
          })
      };

      var myimport = async function(){
        await changeText();
        createImport(data);
      };

      myimport();
    };
    reader.readAsArrayBuffer(f);
  }
  playStop();
}

function createImport(data)
{
  /*
    Args:
          Data: midi黨
    DO:
          匯入midi黨

          清除目前播放
          新建音符表格
          將新的檔案以mysmf製作音源
  */
  clear();                                                                //清除正在播放
  createTable();
  var mysmf = new JZZ.MIDI.SMF(data);                                     //建立新的SMF  放data進入
  // worker.postMessage(mysmf.toString());
  var inputNoteString;
  string = "";
  myppqn = mysmf.ppqn;                                                    //把現在ppqn存在全域變數
  addtable2((Math.ceil(((parseInt(mysmf.toString().split("\n")[mysmf.toString().split("\n").length-1].split(":")[0])/(myppqn/96)/384)-3)/4))); //增加全部table
  var i = 0;                                                              //track數量
  var mysmfTick = 0;                                                      //存目前到第幾個tick
  $("input[name='BPM_val']").val(mysmf[0].toString().split(" ")[(mysmf[0].toString().split(" ").indexOf("Tempo:")) + 1]);     //將BPM放入左上
  $.each(mysmf, function()
  {                                                                                                                           //對每個track做動作
    var smfSplitString = mysmf[i].toString().split("\n");                                                                     //將每個 動作切開
    var j = 0;
    var ticktemp = "";
    var note = "";
    inputNoteString = new Array(84);
                                                                                                                              //紀錄每個track 音符數
      $.each(smfSplitString, function()
      {                                                                                                                       //對每個動作分析
      ticktemp = smfSplitString[j].substring(2, smfSplitString[j].indexOf(":"));                                              //存目前tick

      if (mysmfTick != ticktemp && !isNaN(ticktemp))
      {                                                                                                                       //當目前tick不等於這個音符之tick   tick是否為數字
        mysmfTick = ticktemp;                                                                                                 //現在tick等於後來tick
      }

      var mySplitString = smfSplitString[j].substring(smfSplitString[j].indexOf("--") + 3, smfSplitString[j].indexOf("--") + 10);
      note = parseInt(smfSplitString[j].substring(smfSplitString[j].indexOf(":") + 2, smfSplitString[j].indexOf("-") - 1).split(" ")[1], 16);

      if (mySplitString === "Note On")                                                                                         //當指令note on
      {
        inputNoteString[note] = mysmfTick;
      }
      else if (mySplitString === "Note Of")                                                                                  //當指令為note off
      {
        var calculateTick = parseInt((mysmfTick-inputNoteString[note])/(24*myppqn/96));
        var addNoteString = "<div class='createnote' ondragstart = 'dragStart(event)' draggable='true' >.note(" + note + ",0x60, "+ parseInt(24*calculateTick) +" )</div>";                                                                                                                 //依據中間三個數值的第一個數值 將16進位轉10進位 音量設為64
        if ((-note + 95) > -1)                                                                                                  //音符不得<0
        {
            var mytempnote = document.getElementsByName(note)[0].children[parseInt(inputNoteString[note] / (24 * (myppqn / 96)))];
            mytempnote.innerHTML = addNoteString;
            mytempnote.children[0].style.width = 40*calculateTick + 7*(calculateTick-1);
        }
      }
      console.log(j+"/" + smfSplitString.length);
      j++;
    });
    i++;
    mysmfTick = 0;                                    //重設 讓下一個track用
  });
  start();
  alert('匯入完成!');
  $("#progressbar").hide();
}

function mouseToChoose()                //變換鼠標樣式
{
  /*
  DO:
    更改鼠標樣式
    選取範圍時變為Pointer
  */
  if($('#select').val()=='選取')
  $('body').css('cursor','pointer');
  else
  $('body').css('cursor','default');
}

function changeTone()
{
  /*
    DO:
      更改音色
  */
  port.ch(0).program($('#tone').val());

}

function changeVelocity()
{
  /*
    DO:
      更改音量大小
  */
  port.volumeMSB(0,$("#velocity").val());
}

function clearRange()
{
   /*
    DO:
      清除選取範圍
  */
  whereToStart = 0;
  whereToStop  = table.rows[0].cells.length-1;
  for(j=0;j<whereToStop;j++)
    for (var k = 0; k < chordNum; k++)
    {
      table.rows[k].cells[j].removeAttribute('style');
    }

}

function follow()
{
   /*
     DO:
        跟隨模式轉換
  */
  if($('#follow').val() == '自動')
  {
    followControl = 1;
  }
  else if($('#follow').val() == '分頁')
  {
    followControl = 2;
  }
  else
  {
    followControl = 0;
  }
}

function run(data)
{ 
  if(!data)
    j = whereToStart;
  else
    j = resumeTick;
  var scrollCount = (whereToStart-16)*46;
  var pageCount = 1;
  val = document.getElementsByName("BPM_val")[0].value;
  if(followControl == 1)
    $('#scrolltable').scrollLeft(scrollCount);
  else if (followControl == 2)
    $('#scrolltable').scrollLeft(scrollCount+(8*46));

   id = setInterval(frame, (60 / val) * 250);

  for (var i = 0; i < chordNum; i++)
  {
     if(whereToStart>0)
     table.rows[i].cells[j-1].removeAttribute('style');
     table.rows[i].cells[j].style.borderRightColor = 'red';
  }

  playnotebtn.disabled = true;
  pausenotebtn.disabled = false;
  rerunnotebtn.disabled = false;
  clearnotebtn.disabled = true;

  function frame()
  {
    scrollCount += 46;
    pageCount++;
    if(followControl == 1)
    {
      $('#scrolltable').scrollLeft(scrollCount);
    }
    else if(followControl == 2)
    {
      if((pageCount % 32) == 0)
        $('#scrolltable').scrollLeft(scrollCount+(14*46));
    }
    for (var k = 0; k < chordNum; k++)

    {
      table.rows[k].cells[0].removeAttribute('style');
    }

    if (j < whereToStop)
    {
      if (j != 0)
      {
        for (var k = 0; k < chordNum; k++)
        {
          table.rows[k].cells[j].removeAttribute('style');
        }
      }
      for (var i = 0; i < chordNum; i++)
      {
        table.rows[i].cells[j+1].style.borderRightColor = 'red';
      }
      j++;
      resumeTick = j;
    }
    else
    {
      for (var i = 0; i < chordNum; i++)
      {
        if(whereToStart>0)
        table.rows[i].cells[j-1].removeAttribute('style');
        table.rows[i].cells[j].style.borderRightColor = 'red';

      }
    }
  }
}


function mouseToChoose()                //變換鼠標樣式
{
  /*
    DO:
       更改鼠標樣式

       選取範圍時變為Pointer
  */
  if($('#select').val()=='選取')
    $('body').css('cursor','pointer');
  else
    $('body').css('cursor','default');
}

function changeTone()
{
    /*
      DO:
          更改音色
    */
    port.ch(0).program($('#tone').val());

}

function changeVelocity()
{
   /*
      DO:
          更改音量大小
    */
     port.volumeMSB(0,$("#velocity").val());
}


$(function()
{
  /*
    DO:
        設置背景大小
        防止誤觸關閉
  */
  // $(window).bind('beforeunload', function (e) {
  //               return '';
  //       });
  $(window).resize(function()
  {
    clientWidth = document.body.clientWidth;
  }).resize();

  $(document).keypress(function(e){

    if(e.keyCode == 32 &&　playnotebtn.disabled == false)
    {
      fromBase64();
    }
    else  if(e.keyCode == 32 && playnotebtn.disabled == true)
    {
      playStop();
      playnotebtn.disabled = false;
      clearnotebtn.disabled = false;
      pausenotebtn.disabled = true;
      rerunnotebtn.disabled = true;
    }
  });

  $('#btn4').on('click',function()
  {
    clear();
    createTable();
    if(player)
      playStop();
  });
});
