var StartString = "<div id='dockContainer'><div id='dockWrapper'><div class='cap left'></div><ul class='osx-dock'>"
var HomeString = "<li class='active'><span>Home</span><a href='index.html'><img src='resources/home.png'></a></li>"
var HelpString = "<li class='active'><span>Help</span><a><img src='resources/help.png'></a></li>"
var EditString = "<li class='active'><span>Edit</span><a><img src='resources/notebook.png'></a></li>"
var EndString = "</ul></div></div>"

String = StartString + HomeString + HelpString + EditString + EndString;
document.write(String);