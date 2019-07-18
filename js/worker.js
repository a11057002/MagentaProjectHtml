"use strict";

self.addEventListener("message", e =>
{
	if (e.data === "start")
	{
		importScripts("../js/object.js",
					  "../js/property.js",
					  "../js/controller.js");

		Via.postMessage = (data => self.postMessage(data));
		Start();
	}
	else
	{
		Via.OnMessage(e.data);
	}
});

async function Start()
{
	console.log(self);
	const document = via.document;

	// Demo of retrieving DOM property values
	const [docTitle, docUrl] = await Promise.all([
		get(document.title),
		get(document.URL)
	]);

	console.log("Document title is: " + docTitle + ", URL is: " + docUrl);

	const div = document.createElement("div");
	var table = document.createElement('table');
	table.innerHTML = "yea";
	div.style.color = "white";
	div.style.width = "20%";
	div.style.left  = "40%";
	div.style.position = "absolute";
	div.style.top = "40%";
	div.style.backgroundColor = "black";
	div.style.border = "1px solid white";
	div.style.textAlign = "center";
	document.body.appendChild(div);
	var i = 0;
	setInterval(function(){div.textContent = i;i++;},100);
}
