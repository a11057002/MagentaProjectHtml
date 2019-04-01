var BackString = "<canvas style='z-index: -1;position: fixed;' id='canvas'></canvas><link rel='stylesheet' type='text/css'href='../local/OSXcss.css'><script src = '../local/back.js'></script> " // 背景
var StartString = "<div id='dockContainer'><div id='dockWrapper'><div class='cap left'></div><ul class='osx-dock'>"
var HomeString = "<li class='active'><span>Home</span><a href='../web/index.html'><img src='../resources/home.png'></a></li>"
var HelpString = "<li class='active'><span>Help</span><a ><img src='../resources/help.png'></a></li>"
var EditString = "<li class='active'><span>Edit</span><a href= '../web/MidiEdit.html'><img src='../resources/notebook.png'></a></li>"
var EndString = "</ul></div></div>"

String = BackString + StartString + HomeString + HelpString + EditString + EndString;
document.write(String)