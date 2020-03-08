var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var commands = Commander.activeCommands().map((cmd) => cmd.title);
var grammar = '#JSGF V1.0; grammar colors; public <command> = ' + commands.join(' | ') + ' ;';

console.log(grammar);

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

window.onload = function () {
    recognition.start();
    console.log('Ready to receive a command.');
};

recognition.onresult = function(event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at the last position.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object

    console.log(event);
    var command = event.results[event.results.length - 1][0].transcript;
    console.log('Result received: ', command);
    console.log('Confidence: ' + event.results[0][0].confidence);
    let cmd = Commander.findCommandForSpeech(command);
    Commander.executeCommand(cmd.commandLineName);
};

recognition.onspeechend = function() {
    //console.log('Recognition stopped');
    //recognition.stop();
    //recognition.start();
};

recognition.onnomatch = function(event) {
    console.log("I didn't recognise that command.");
};

recognition.onerror = function(event) {
    console.error('Error occurred in recognition: ', event.error);
};
