var audio;
var play;
var input = document.getElementById('midi');
var anchor = document.getElementById('wav');

input.addEventListener('change', function change() {
  // clean up previous song, if any
  if (anchor.hasAttribute('href')) {
    URL.revokeObjectURL(anchor.href);
    anchor.removeAttribute('href');

    if (audio && !audio.paused) {
      audio.pause();
    }
  }

  // check if file exists
  if (input.files.length > 0) {
    var reader = new FileReader();
    var midName = input.files[0].name;
    // replace file extension with .wav
    var wavName = midName.replace(/\..+?$/, '.wav');

    // set callback for array buffer
    reader.addEventListener('load', function load(event) {
      // convert midi arraybuffer to wav blob
      var wav = synth.midiToWav(event.target.result).toBlob();
      // create a temporary URL to the wav file
      var src = URL.createObjectURL(wav);

      // audio = new Audio(src);
      //
      // play = false;
      anchor.innerHTML = "  ";
      anchor.setAttribute('href', src);
    });

    // read the file as an array buffer
    reader.readAsArrayBuffer(input.files[0]);

    // set the name of the wav file
    anchor.setAttribute('download', wavName);
  }
});
//
//
// JZZ.synth.Tiny.register('Web Audio');
// var out = JZZ().or(report('Cannot start MIDI engine!')).openMidiOut().or(report('Cannot open MIDI Out!'));
// var player;
// var playing = false;
// var log = document.getElementById('log');
// var btn2 = document.getElementById('btn');
//
// function fromFile() {
//   if (window.FileReader) {
//     btn2 = document.getElementById('btn');
//     clear();
//     var reader = new FileReader();
//     var f = document.getElementById('file').files[0];
//     reader.onload = function(e) {
//       var data = '';
//       var bytes = new Uint8Array(e.target.result);
//       for (var i = 0; i < bytes.length; i++) {
//         data += String.fromCharCode(bytes[i]);
//       }
//       load(data, f.name);
//     };
//     reader.readAsArrayBuffer(f);
//   } else log.innerHTML = 'File API is not supported in this browser.';
// }
//
// function report(s) {
//   return function() {
//     // log.innerHTML = s;
//   };
// }
//
// function clear() {
//   if (player) player.stop();
//   playing = false;
//   btn2.innerHTML = 'Play';
//   btn2.disabled = true;
// }
//
// function load(data, name) {
//   try {
//     player = JZZ.MIDI.SMF(data).player();
//     console.log(data);
//     console.log(JZZ.lib.toBase64(data));
//     var mysmf = new JZZ.MIDI.SMF(data);
//     console.log(mysmf[0]);
//     console.log(mysmf[1]);
//     player.connect(out);
//     player.onEnd = function() {
//       playing = false;
//       btn2.innerHTML = "Play";
//     }
//     playing = true;
//     player.play();
//     // log.innerHTML = name;
//     btn2.innerHTML = 'Stop';
//     btn2.disabled = false;
//   } catch (e) {
//     // log.innerHTML = e;
//   }
// }
//
// function playStop() {
//   if (playing) {
//     player.stop();
//     playing = false;
//     btn2.innerHTML = 'Play';
//   } else {
//     player.play();
//     playing = true;
//     btn2.innerHTML = 'Stop';
//   }
// }