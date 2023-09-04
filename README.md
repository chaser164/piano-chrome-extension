A simple piano Chrome Extension utilizing the Tone.js web audio framework (https://tonejs.github.io/).

 Play the keys with either the mouse or the computer keyboard. Use up/right and down/left arrow keys to change octaves. Press the shift button to toggle sustain on/off.

Currently, I'm copy-pasting Tone.js's source code from https://unpkg.com/tone into the local tone.js file. This is a workaround for the Content Security Policy error that gets raised when I try importing this script through its URL in popup.html.