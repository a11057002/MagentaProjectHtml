var BackString = "<canvas style='z-index: -1;float:left;background-attachment:fixed; position:fixed;' id='canvas'></canvas><script src = '../js/back.js'></script><link rel='stylesheet' type='text/css'href='../css/OSXcss.css'> " // 背景  <script src = '../js/back.js'></script>
var StartString = "<div id='dockContainer'><div id='dockWrapper'><div class='cap left'></div><ul class='osx-dock'>"
var HomeString = "<li class='active'><span>Home</span><a href='../web/index.html'><img src='../resources/home.png'></a></li>"
var HelpString = "<li class='active'><span>Help</span><a href='../web/help.html' ><img src='../resources/help.png'></a></li>"
var EditString = "<li class='active'><span>Edit</span><a href= '../web/MidiEdit.html'><img src='../resources/notebook.png'></a></li>"
var EndString = "</ul></div></div>"

var myString = BackString + StartString + HomeString + HelpString + EditString + EndString;
document.write(myString)
