var audio;
var play;
var input = document.getElementById('midi');
var anchor = document.getElementById('wav');
document.writeln(anchor)
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

      audio = new Audio(src);
      audio.play();
      play = true;
      document.getElementById("button").innerHTML = "Pause";
      anchor.setAttribute('href', src);
    });

    // read the file as an array buffer
    reader.readAsArrayBuffer(input.files[0]);

    // set the name of the wav file
    anchor.setAttribute('download', wavName);
  }
});

function Play() {
  if (play == true) {
    audio.pause();
    play = false;
    document.getElementById("button").innerHTML = "Play";
  } else {
    audio.play();
    play = true;
    document.getElementById("button").innerHTML = "Pause";
  }
}

function Stop() {
  audio.pause();
  audio.currentTime = 0;
  document.getElementById("button").innerHTML = "Play";
}