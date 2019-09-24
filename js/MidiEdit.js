JZZ.synth.Tiny.register('Synth');
JZZ.synth.Tiny.register('Web Audio');
var port = JZZ().openMidiOut().or(function() {alert('Cannot open MIDI port!');});
var table = document.getElementById("mytable");                                        //拿table
var playnotebtn = document.getElementById("btn");
var noteTable = document.getElementById("mynote");
var pausenotebtn = document.getElementById("btn2");
var rerunnotebtn = document.getElementById("btn3");
var clearnotebtn = document.getElementById("btn4");
var clearrangebtn = document.getElementById("btn5");
var chordNum = 96;                                                                   //鍵盤音符數量
var b64, str, uri, myppqn = 96;
var tempnote;
var positiondata;                                                                     // drag previous tick data
var previousevent;                                                                    // drag previous event
var playing = false;
var resizeNote = false;                                                               //音符目前總量
var whereToStart = 0;
var whereToStop = 0;
var tempwidth,newWidth;
var BPMval;                                                                              //bpm value
var cursorX;
var noteToResize;
var noteWidth;
var resume = false;
var followControl = 0;
var idOfSetInterval,idOfSetInterval2;
var resumeTick = 0;
var string,string2,string3;
var trk = new Array();
var mycursor;
var cursortype = {
   'pointer' : "pointer",
   'default' : "default"
};
var tickToPlay;
// var player;

pausenotebtn.disabled = true;
rerunnotebtn.disabled = true;
clearnotebtn.disabled = false;
document.getElementById('maintable').scrollTop=document.body.clientHeight*0.8;

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
  var note = new Array("B", "A#", "A", "G#", "G", "F#", "F", "E", "D#", "D", "C#", "C"); //音符陣列
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

function addtable(count)
{
  /*
    DO:
        增加表格格數
        目前一次增加2小節

  */
  var tablenode = "<td class ='eight_td'></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>";
  var tablett = document.getElementsByClassName('tt');
  var tablestring="";
  if(count!=1)
  for(var j = 0;j<count;j++)
  {
    tablestring += tablenode + tablenode+ tablenode+ tablenode;
  }
  else {
    tablestring +=tablenode;
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
    event.target.innerHTML = "<div style='width:" + ((positiondata/24*40) + (positiondata/24-1)*6) + "px' class='createnote' ondragstart = 'dragStart(event)' draggable='true' >.note("+event.toElement.parentNode.attributes[1].nodeValue+",0x60, "+ positiondata +" )</div>";
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
  // $('.tt td').attr('ondrop','drop(event)');
  // $('.tt td').attr('ondragover','allowDrop(event)');
  // $('.tt td').attr('ondragend','dragEnd(event)');

  $('.tt td').on('mousedown', function(event)
  {
    if(event.which == 1)
    {
      if(mycursor=='pointer')
      {
        if(playing)
        {
           for (var i = 0; i < chordNum; i++)
           table.rows[i].cells[tickToPlay-1].removeAttribute('style');
           tickToPlay = $(this).index();

        }
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
            addtable(1);
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
    if(event.which == 1 && mycursor!='pointer')
    {
      if($(this).parent().attr("name") != tempnote)
      {
        stopnote(tempnote);
        playnote($(this).parent().attr("name"));
        tempnote = $(this).parent().attr("name");
      }

      if(resizeNote && noteToResize!= undefined && noteToResize != "")
      {
        tempwidth = noteWidth + (event.clientX - cursorX);       //修改長度時 隨時更改
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

    if(resizeNote && tempwidth!= undefined && noteToResize != "")
    {
      if(tempwidth<=46)
      {
        noteToResize.css('width', '40px');
        noteToResize.html(".note(" + $(this).parent().attr('name') + ",0x60, 24 )");
      }
      else
      {
        newWidth = (parseInt(tempwidth/46)+1)*40 + (parseInt(tempwidth/46))*6;
        newTick = (parseInt(tempwidth/46)+1)*24;
        noteToResize.css('width',  newWidth + 'px');
        noteToResize.html(".note(" + $(this).parent().attr('name') + ",0x60, "+ newTick +" )");  //24  tick旁邊有空白方便切割
      }
      noteToResize = '';
      tempwidth = 0;
      newWidth = 0;
    }
  });

  $('.tt td').on('contextmenu',function()
  {
    if( mycursor =='pointer' && whereToStart < $(this).index())
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
    for(j=0;j<=whereToStop;j++)
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
  var smf = new JZZ.MIDI.SMF(1, 96);
  trk[0] = new JZZ.MIDI.SMF.MTrk();
  trk[1] = new JZZ.MIDI.SMF.MTrk();
  trk[2] = new JZZ.MIDI.SMF.MTrk();
  trk[3] = new JZZ.MIDI.SMF.MTrk();
  smf.push(trk[0]);
  smf.push(trk[1]);
  smf.push(trk[2]);
  smf.push(trk[3]);
  BPMval = document.getElementsByName("BPM_val")[0].value;
  trk[0].smfBPM(BPMval); //speed

  $("#script0").remove();
  $("#script1").remove();
  $("#script2").remove();
  $("body").append("<script id='script0'>" + string + ".smfEndOfTrack();</script>");       //第一個track音符
  $("body").append("<script id='script1'>" + string2 + ".smfEndOfTrack();</script>");      //第二個track音符
  $("body").append("<script id='script2'>" + string3 + ".smfEndOfTrack();</script>");      //第二個track音符
  string = "";
  string2 = "";
  string3 = "";
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
  playing = false;
}

// function load(data, name)     以前的播放
// {
//   /*
//     Args:
//           Data:音源 打印smf的格式
//           name:命名
//     DO:
//           設置player 將上排工具列連接至player
//           player 重複播放設為true
//           開始播放
//   */
//   try
//   {
//     var tools = JZZ().or(report('Cannot start MIDI engine!')).openMidiOut().or(report('Cannot open MIDI Out!'));
//     player = JZZ.MIDI.SMF(data).player();
//     player.loop(true);
//     player.connect(tools);
//     player.onEnd = function()
//     {
//       playing = false;
//       playnotebtn.innerHTML = "Play";
//     }
//     playing = true;
//     $("#export").removeAttr("disabled");
//   }
//   catch (e)
//   {
//     console.log(e);
//   }
// }

function playStop()
{
  /*
    DO:
        播放音樂
        進度條清除
  */
  playing = false;
  resume = false;
  playnotebtn.innerHTML = "Play";
  playnotebtn.setAttribute("onclick", "playSong()");
  clearTimeout(idOfSetInterval);
  clearTimeout(idOfSetInterval2);
  for (var i = 0; i < chordNum; i++)
  {
      if(whereToStart>0)
          table.rows[i].cells[whereToStart-1].style.borderRightColor = 'red';
      if(resumeTick>0)
          table.rows[i].cells[resumeTick-1].removeAttribute('style');
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
  playing = false;
  resume = true;
  playnotebtn.setAttribute("onclick", "continuePlay()");
  clearTimeout(idOfSetInterval);
  clearTimeout(idOfSetInterval2);
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
  // player.resume();
  // player.onEnd = function() {
  // playing = false;
  // playnotebtn.innerHTML = "Play";
  // }
  run(1);
}

function playSong() //轉為b64格式
{
  /*
    DO:
        進度調開跑
        停止目前播放
        將現有音符加入字串
        製作音源
        播放音源
  */
  clear();
  run(0);
}


function upLoad()
{

  /*
    DO:
        上傳輸入密碼 
        輸入檔案名稱
  */
  Swal.fire({
    title:'請輸入上傳密碼!',
    input:'text',
    showCancelButton: true,
    backdrop: `url("../resources/ball.gif")
               rgba(0,0,150,0.4)
               center left
               no-repeat
              `

  }).then((result)=>
    {
      if(result.value)
      firestore.collection('password').get().then(snap =>
        {
           snap.forEach(item =>
            {
             if(item.id == 'pass')
                 if(result.value == item.data().pass)
                    {
                       Swal.fire(
                       {
                         title:'輸入上傳檔案名稱',
                         input:'text',
                         showCancelButton: true,
                       }).then((result)=>
                                    {
                                      if(result.value)
                                      {
                                        addnote();
                                        createSMF();
                                        firestore.collection('midi').doc(result.value).set(
                                          {
                                            'b64': b64
                                          });
                                        Swal.fire(
                                          {
                                            title:"上傳成功(重整後可看到)",
                                            type:'success'
                                          });
                                      }
                                    });
                    }
                 else
                 {
                  Swal.fire(
                  {
                    title:"密碼錯誤",
                    type:'error',
                    backdrop:`rgba(100,0,0,0.4)`
                  });
                 }

            })
        });
    });

}

function exportMidi()
{
  /*
    DO:
        匯出
  */
  var mypromise = function()
  {
    return new Promise(function(resolve,reject)
    {
        addnote();
        createSMF();
        setTimeout(function()
        {
          resolve();
        },100);
    });
  };

  var myexport = async function()
  {
      await mypromise();
      location.href = uri;
  }
  myexport();
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
      var changeText = function()
      {
        return new Promise(function(resolve,reject)
        {
            Swal.fire({
                        title:"Importing " + f.name,
                        showConfirmButton: false,
                        background: ' url(../resources/label.jpg)',
                        onBeforeOpen:() =>
                        {
                          Swal.showLoading();
                        }
                     })
            setTimeout(function()
            {
              resolve();
            },10)
        })
      };

      var myimport = async function()
      {
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
          選擇匯入軌道
          清除目前播放
          新建音符表格
          將新的檔案以mysmf製作音源
  */
  clear();                                                                //清除正在播放
  createTable();
  var mysmf = new JZZ.MIDI.SMF(data);                                     //建立新的SMF  放data進入
  var inputNoteString;
  var inputVolumeString;
  var maxTick = 0;
  var currentTrackNum = 0;                                                              //目前匯入track數量
  var mysmfTick = 0;                                                      //存目前到第幾個tick
  var trackSum = (mysmf.toString().split("MTrk:")[0]).split("tracks:")[1];//tracks 總數
  var tracksString = "";                                                  //存軌道字串      
  var trackArray = new Array(trackCount);                                 //存軌道是否匯入 0-false 1-true
  myppqn = mysmf.ppqn;                                                    //把現在ppqn存在全域變數
  $.each(mysmf,function(e)
  {                                                                       //計算最大軌道長度
      var temp = Math.ceil(mysmf[e].toString().split("\n")[mysmf[e].toString().split("\n").length-1].split(":")[0]/(myppqn/96)/16/24-3);
      if(temp > maxTick)
          maxTick = temp;
  });
  addtable(maxTick/4);                                                    //增加全部table
  $("input[name='BPM_val']").val(mysmf.toString().split(" ")[(mysmf.toString().split(" ").indexOf("Tempo:")) + 1]);     //將BPM放入左上
  for (var  trackCount= 1; trackCount< trackSum;trackCount++)             //初始化 
  {
    tracksString += "<h3><input type='checkbox' id= 'trk"+ trackCount +"' ></input> track " + trackCount + " </h3><br>";
    trackArray[trackCount] = 0;
  }
  Swal.fire({
                title: "Choose the tracks to input",
                html: tracksString,
                preConfirm: ()=>
                {
                  for(var  trackCount= 1; trackCount< trackSum;trackCount++)
                  {
                     if(document.getElementById('trk'+trackCount).checked)
                     trackArray[trackCount] = 1;
                  }
                }
            }).then(()=>{   
                          Swal.fire({
                                      title:"Importing ",
                                      showConfirmButton: false,
                                      background: ' url(../resources/label.jpg)',
                                      onBeforeOpen:() =>
                                      {
                                        Swal.showLoading();
                                      }
                                    })
                        }).then(()=>{$.each(mysmf, function()                                                //對每個track做動作 
                        {                                                       
                          var smfSplitString = mysmf[currentTrackNum].toString().split("\n");                                      //將每個 動作切開
                          var splitStringNum = 0;
                          var ticktemp = "";
                          var note = "";
                          var volume = "";
                          inputNoteString = new Array(84);
                          inputVolumeString = new Array(84);                                                                                                                      //紀錄每個track 音符數
                            $.each(smfSplitString, function()
                            {                                                                                                      //對每個動作分析
                              if(trackArray[currentTrackNum]==0)
                                return;

                              ticktemp = smfSplitString[splitStringNum].substring(2, smfSplitString[splitStringNum].indexOf(":")); //存目前tick

                            if (mysmfTick != ticktemp && !isNaN(ticktemp))
                            {                                                                                                      //當目前tick不等於這個音符之tick   tick是否為數字
                              mysmfTick = ticktemp;                                                                                //現在tick等於後來tick
                            }
                            var mySplitString = smfSplitString[splitStringNum].substring(smfSplitString[splitStringNum].indexOf("--") + 3, smfSplitString[splitStringNum].indexOf("--") + 10);
                            note = parseInt(smfSplitString[splitStringNum].substring(smfSplitString[splitStringNum].indexOf(":") + 2, smfSplitString[splitStringNum].indexOf("-") - 1).split(" ")[1], 16);
                            volume = parseInt(smfSplitString[splitStringNum].substring(smfSplitString[splitStringNum].indexOf(":") + 2, smfSplitString[splitStringNum].indexOf("-") - 1).split(" ")[2], 16);
                            if (mySplitString === "Note On")                                                                       //當指令note on
                            {
                              inputNoteString[note] = mysmfTick;
                              inputVolumeString[note] = volume;

                            }
                            else if (mySplitString === "Note Of")                                                                  //當指令為note off
                            {
                              var calculateTick = Math.round((mysmfTick-inputNoteString[note])/(24*myppqn/96));
                              var addNoteString = "<div class='createnote' ondragstart = 'dragStart(event)' draggable='true' >.note(" + note + ",0x60, "+ parseInt(24*calculateTick) +"  )</div>";                                                                                                                 //依據中間三個數值的第一個數值 將16進位轉10進位 音量設為64
                              if ((-note + 95) > -1)                                                                               //音符不得<0
                              {
                                  var mytempnote = document.getElementsByName(note)[0].children[parseInt(inputNoteString[note] / (24 * (myppqn / 96)))];
                                  mytempnote.innerHTML = addNoteString;
                                  mytempnote.children[0].style.width = 40*calculateTick + 6*(calculateTick-1);
                              }
                            }
                            splitStringNum++;
                          });
                          currentTrackNum++;
                          mysmfTick = 0;                                                                                           //重設 讓下一個track用
                        });
  start();
  Swal.fire(
    {
      type: 'success',
      background: ' url(../resources/label.jpg)',
      title:"匯入完成"
    });
});
}

function mouseToChoose()
{
  /*
  DO:
    更改鼠標樣式
    選取範圍時變為Pointer
  */
  if($('#select').val()=='選取')
  mycursor = cursortype.pointer;
  else
  mycursor = cursortype.default;
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
  for (var k = 0; k < chordNum; k++)
  {
    if(whereToStart>0)
    table.rows[k].cells[whereToStart-1].removeAttribute('style');
    table.rows[k].cells[whereToStop].removeAttribute('style');
  }
  whereToStart = 0;
  whereToStop  = table.rows[0].cells.length-1;

}

function clearTable()
{
  /*
    DO:
      清空所有表格
  */
    clear();
    Swal.fire({
          title: '確定清空?',
          type: 'warning',
          background: ' url(../resources/label.jpg)',
          padding: '3em',
          showCancelButton:true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes',
          backdrop:`rgba(100,0,0,0.4)`
         }).then((result) =>{if(result.value)createTable();})
    // if(player)
    //   playStop();
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
  /*
    DO:
      播放
  */
  var scrollCount = (whereToStart-16)*46;
  var pageCount = 1;
  var count = 0;
  playing = true;
  if(!data)
  {
    j = whereToStart;
    tickToPlay = whereToStart;
  }
  else
  {
    j = resumeTick;
    tickToPlay = resumeTick;
    var scrollCount = (resumeTick-16)*46;
  }

  BPMval = document.getElementsByName("BPM_val")[0].value;
  if(followControl == 1)
    $('#scrolltable').scrollLeft(scrollCount);
  else if (followControl == 2)
    $('#scrolltable').scrollLeft(scrollCount+(8*46));

  idOfSetInterval = setTimeout(frame,0);

  playnotebtn.disabled = true;
  pausenotebtn.disabled = false;
  rerunnotebtn.disabled = false;
  clearnotebtn.disabled = true;

  function frame()
  {
    j = tickToPlay;
    scrollCount = (tickToPlay-16) * 46;
    if(tickToPlay <= whereToStop)
    {
      for(;count<chordNum;count++)
      {
          var noteForPlay = table.children[count].children[0].children[tickToPlay].innerText.substring(6,18).split(",");
          if(noteForPlay != "")
          {
            port.note(0,noteForPlay[0],60,((60 / BPMval) * 250 *(noteForPlay[2]/24)-10));
          }
      }
    }
    else
    {
      tickToPlay = whereToStart-1;
      clearTimeout(idOfSetInterval);
      clearTimeout(idOfSetInterval2);
      scrollCount = (whereToStart-16)*46;
      j = whereToStart-1;
      if(j<0)
        j=0;
    }
    tickToPlay++;
    count=0;
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
          table.rows[k].cells[j-1].removeAttribute('style');
        }
      }
      for (var i = 0; i < chordNum; i++)
      {
        table.rows[i].cells[j].style.borderRightColor = 'red';
      }
      j++;
      resumeTick = j;
    }
    else
    {
      for (var i = 0; i < chordNum; i++)
      {
        table.rows[i].cells[j-1].removeAttribute('style');
      }
    }
    idOfSetInterval2 = setTimeout(frame, (60 / BPMval) * 250);
  }
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

function importExample()
{
  if($('#importExample :selected').text() != "")
  Swal.fire({
  title: 'Are you sure to import  \n'+ $('#importExample :selected').text() +' ?',
  type: 'warning',
  background: ' url(../resources/label.jpg)',
  padding: '3em',
  showCancelButton:true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes',
}).then((result) =>
                      {
                        if (result.value)
                        {
                           var changeText = function()
                            {
                                  return new Promise(function(resolve,reject){
                                  Swal.fire({
                                    title:"Importing",
                                    background: 'url(../resources/label.jpg)',
                                    showConfirmButton: false,
                                    backdrop: `rgba(100,0,100,0.4)
                                               url("../resources/dove.gif")
                                               center left
                                               no-repeat
                                              `,
                                    onBeforeOpen:() =>{
                                    Swal.showLoading();
                                    }
                                  })
                                  setTimeout(function(){
                                    resolve();
                                  },100)
                                })
                            };

                            var myimport = async function(){
                              await changeText();
                              createImport(JZZ.lib.fromBase64($('#importExample').val()));
                            };
                           myimport();

                        }
                        else
                        $("#importExample")[0].selectedIndex = 0;

      })


}

$(function()
{
  /*
    DO:
        設置背景大小
        防止誤觸關閉
  */
  $('body').attr('ondrop','drop(event)');
  $('body').attr('ondragover','allowDrop(event)');
  $('body').attr('ondragend','dragEnd(event)');

  $(window).bind('beforeunload', function (e) {
                return '';
        });

  $(window).resize(function(e)
  {
    clientWidth = document.body.clientWidth;
  }).resize();


});

document.addEventListener('DOMContentLoaded', function (event)
{
  /*
    DO:
        禁止調整視窗縮放大小
  */
    document.body.style.zoom = 'reset';
    document.addEventListener('keydown', function (event)
    {
      if(!(47<event.keyCode && event.keyCode<58) && !(95<event.keyCode && event.keyCode<106)  && !(36<event.keyCode && event.keyCode<41) && !(event.keyCode == 8)   && !(event.keyCode==46))
      event.preventDefault();
      if(event.keyCode == 13)   //enter   back to postition of wheretostart
      {

        $('#scrolltable').scrollLeft((whereToStart-16)*46);
      }
      else if(event.keyCode == 80)   // p   pause playing
      {
        if(playing)
          playPause();
      }
      else if(event.keyCode == 32 &&　playnotebtn.disabled == false)   //space  play or continue to play
      {
        if(resume)
          continuePlay();
        else
          playSong();
      }
      else if(event.keyCode == 32 && playnotebtn.disabled == true)    //space  strop playing
      {
        playStop();
      }
      else if(event.keyCode == 70)   // f follow mode
      {
        $('#follow').val("自動");
        followControl = 1;
      }
      else if(event.keyCode == 72)  // h hand mode
      {

        $('#follow').val("手動");
        followControl = 0;
      }
      else if(event.keyCode == 83)  // S hand mode
      {

        $('#follow').val("分頁");
        followControl = 2;
      }
      else if(event.keyCode == 69)  // e  edit note
      {
        $('#select').val('編輯');
        mycursor = cursortype.default;
      }
      else if (event.keyCode == 82)   // r select range
      {
        $('#select').val('選取');
        mycursor = cursortype.pointer;
      }
      else if (event.keyCode == 67)  // c clear table
      {
        if(!playing)
        clearTable();
      }
      else if (event.keyCode == 116)   //f5
      {
        location.reload();
      }
    }, false);
    document.addEventListener('mousewheel', function (event)
    {
      if (event.ctrlKey === true)
      {
        event.preventDefault();
        return false;
      }
    }, {passive : false });
}, false);
