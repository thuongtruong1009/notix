let startButton = document.getElementById("start-btn");

startButton.addEventListener("click", () => {
  var permission = navigator.permissions.query({name: 'microphone'});
  permission.then(function(permissionStatus) {
    if (permissionStatus.state == "denied" || permissionStatus.state == "prompt") {
      const enableMicString = "Microphone access denied. Please allow microphone access in your browser settings.\n\n* Step 1: Right click on the Notix extension icon\n* Step 2: choose View web permission\n* Step 3: Change microphone selection to Allow";
      alert(enableMicString);
    }
    if (permissionStatus.state == "granted") {
      var output = document.getElementById("output");
      var action = document.getElementById("action");
      var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      var recognition = new SpeechRecognition();
  
      recognition.onstart = function() {
          action.innerHTML = "<small>listening, please speak...</small>";
      };
      
      recognition.onspeechend = function() {
          action.innerHTML = "<small>stopped listening, hope you are done...</small>";
          recognition.stop();
      }
    
      recognition.onresult = function(event) {
          var transcript = event.results[0][0].transcript;
          output.innerHTML = "<b>Text:</b> " + transcript;
          output.classList.remove("hide");
      };
    
      recognition.start();
    }
  });
});

// const startButton = document.getElementById('startButton');
// const stopButton = document.getElementById('stopButton');
// const output = document.getElementById('output');

// const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

// recognition.continuous = true; // Continuous listening
// recognition.interimResults = true; // Provides interim results

// recognition.onresult = (event) => {
//   const result = event.results[event.resultIndex][0].transcript;
//   output.textContent = result;
// };

// recognition.onerror = (event) => {
//   console.error('Speech recognition error:', event.error);
// };

// startButton.addEventListener('click', () => {
//   navigator.mediaDevices.getUserMedia({ audio: true })
//     .then(() => {
//       recognition.start();
//       startButton.disabled = true;
//       stopButton.disabled = false;
//       output.textContent = 'Listening...';
//     })
//     .catch((error) => {
//       console.error('Error accessing the microphone:', error);
//       alert('Microphone access denied. Please allow microphone access in your browser settings.');
//     });
// });

// stopButton.addEventListener('click', () => {
//   recognition.stop();
//   startButton.disabled = false;
//   stopButton.disabled = true;
//   output.textContent = 'Speech recognition stopped.';
// });
