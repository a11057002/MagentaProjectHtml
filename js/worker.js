"use strict";


var div;
var documentt;
self.addEventListener("message", e =>
{	

	if (e.data === "start")
	{
		importScripts("../js/object.js",
					  "../js/property.js",
					  "../js/controller.js",
					  "../github/JZZ-master/javascript/JZZ.js");
		const documentt = via.document;
		div = documentt.createElement("div");
		div.style.color = "white";
		div.style.width = "20%";
		div.style.height = "3%";
		div.style.left  = "40%";
		div.style.position = "absolute";
		div.style.top = "40%";
		div.style.backgroundColor = "black";
		div.style.border = "1px solid white";
		div.style.textAlign = "center";
		// documentt.body.appendChild(div);
		Via.postMessage = (data => self.postMessage(data));
	}
	else
	{	
		if(typeof e.data == 'string')
		{
		console.log(e.data);
		div.textContent = e.data;	
		}
		// Via.OnMessage(e.data);	
	}
});

