let notesDict = {'a': ['C', false], 'w': ['Db', false], 's': ['D', false], 'e': ['Eb', false], 'd': ['E', false], 'f': ['F', false], 't': ['Gb', false], 'g': ['G', false], 'y': ['Ab', false], 'h': ['A', false], 'u': ['Bb', false], 'j': ['B', false], 'k': ['Cn', false], 'o': ['Dbn', false], 'l': ['Dn', false], 'p': ['Ebn', false], ';': ['En', false], '\'': ['Fn', false], ']': ['Gbn', false], 'enter': ['Gn', false]}
let activeNotes = [];
let mouseDown = false;
let octave = 3;
let sustain = false;
let panelInteraction = false; 

//Once popup is loaded...
document.addEventListener('DOMContentLoaded', function() {

    // Create the polysynth
    const poly = new Tone.PolySynth().toDestination();

    // For each note, check to see if mouse triggers it and play/stop the notes
    for (key in notesDict) {
        listenMouse(key);
    }

    // Play notes on keydown
    document.onkeydown = function (e) {
        pressed = e.key.toLowerCase();
        // Account for special characters involved in the keyboard
        switch(pressed) {
            case ':':
                pressed = ';';
                break;
            case '"':
                pressed = '\'';
                break;
            case '}':
                pressed = ']';
                break;
        }
        for (key in notesDict) {
            if (key == pressed) {
                //Make sure note is not currently pressed and that note isn't currently being played
                if (!notesDict[pressed][1]) {
                    if (!activeNotes.includes(config(notesDict[pressed][0]))) {
                        notesDict[pressed][1] = true;
                        poly.triggerAttack(config(notesDict[pressed][0]));
                        offsetColor(notesDict[pressed][0]);
                        activeNotes.push(config(notesDict[pressed][0]));
                        break;
                    } else if (sustain) { // immediate release-attack
                        notesDict[pressed][1] = true;
                        poly.triggerRelease(config(notesDict[pressed][0]));
                        poly.triggerAttack(config(notesDict[pressed][0]));
                        offsetColor(notesDict[pressed][0]);
                    }
                } 
            }
        }
    };
    
    //Stop note on keyup & manage shift button sustain feature & manage arrow key octave shift feature 
    document.onkeyup = function (e) {
        pressed = e.key.toLowerCase();
        for (key in notesDict) {
            if (key == pressed) {
                notesDict[pressed][1] = false;
                correctColor(notesDict[pressed][0]);
                if (!sustain) {
                    activeNotes.splice(activeNotes.indexOf(config(notesDict[pressed][0])), 1);
                    poly.triggerRelease(config(notesDict[pressed][0]));
                }
                break;
            }
        }

        // Toggle sustain
        if (pressed == 'shift') {
            sustain = !sustain;
            // When sustain is lifted, release all notes that are not currently being played
            if (!sustain) {
                releaseAllButCurrent();
            }
        }
        
        // Increase octave on u/r arrow presses
        if ((pressed == 'arrowup' || pressed == 'arrowright') && octave < 7) {
            octave++;
            if (!sustain) {
                releaseAll();
            }
            unpressAll();
            console.log('octave:' + octave);
        }

        // Decrease octave on d/l arrow presses
        if ((pressed == 'arrowdown' || pressed == 'arrowleft') && octave > 0) {
            octave--;
            if (!sustain) {
                releaseAll();
            }
            unpressAll();
            console.log('octave:' + octave);
        }

        // Release notes
        // Update active notes to the empty list
        function releaseAll() {
            activeNotes = []
            for (let i = 0; i < 8; i++) {
                for (key in notesDict) {
                    poly.triggerRelease(config(notesDict[key][0], i));
                }  
            }
        }
        // Correct all colors on the display
        function unpressAll() {
            for (key in notesDict) {
                correctColor(notesDict[key][0]);
            }
        }

        // Release all notes that aren't currently being played (for octave changes and unsustaining)
        function releaseAllButCurrent() {
            // Refresh active notes list (in case of octave change)
            activeNotes = []
            for (key in notesDict) {
                if (notesDict[key][1]) {
                    activeNotes.push(config(notesDict[key][0]));
                }
            }  
            // Release all notes not currently being played
            for (let i = 0; i < 8; i++) {
                for (key in notesDict) {
                    if (!activeNotes.includes(config(notesDict[key][0], i))) {
                        poly.triggerRelease(config(notesDict[key][0], i));
                    }
                }  
            }
        } 
    };

    // Listen for mouse events and trigger notes accordingly
    function listenMouse(key) {
        let note = notesDict[key][0];
        let playListeners = ['mouseenter', 'mousedown'];

        for (let i = 0; i < playListeners.length; i++) {
            document.querySelector('#' + note).addEventListener(playListeners[i], function() {
                //Check if mouse is clicked down
                if ((mouseDown || playListeners[i] == 'mousedown' && !panelInteraction)) { 
                    //If note not already being played...
                    if (!notesDict[key][1]) {
                        // Play the note if not already being played
                        if (!activeNotes.includes(config(note))) {
                            notesDict[key][1] = true;
                            poly.triggerAttack(config(note));
                            offsetColor(note);
                            activeNotes.push(config(note));
                        } else if (sustain) { // Immediate release-attack
                            notesDict[key][1] = true;
                            poly.triggerRelease(config(note));
                            poly.triggerAttack(config(note));
                            offsetColor(note);
                        }
                        stop();
                    }
                }
            });
        }

        // Stop the note when mouse events prompt it
        function stop() {
            let stopListeners = ['mouseup', 'mouseleave'];
            // Listen for both stopping cases
            for (let i = 0; i < stopListeners.length; i ++) {
                document.querySelector('#' + note).addEventListener(stopListeners[i], function() {
                    if (mouseDown && notesDict[key][1]) {
                        notesDict[key][1] = false;
                        correctColor(note);
                        if (!sustain) {
                            activeNotes.splice(activeNotes.indexOf(config(note)), 1);
                            poly.triggerRelease(config(note));
                        }
                    }
                });
            }
        }
    }

    //Keep track of mousedown events:
    document.body.onmousedown = function() { 
        mouseDown = true;
    }
    document.body.onmouseup = function() {
        mouseDown = false;
    }

    // Check if mouse has left the piano frame, in this case mouseDown will be set to false
    document.querySelector('.piano-frame').addEventListener('mouseleave', function() {
        mouseDown = false;
    });

    // Ensure notes aren't played when mouse is interacting with control panel
    document.querySelector('.panel').addEventListener('mouseenter', function() {
        panelInteraction = true;
    });

    document.querySelector('.panel').addEventListener('mouseleave', function() {
        panelInteraction = false;
    });

    // Open info page on info button click
    document.querySelector('.info-button').addEventListener('mousedown', function() {
        //Open info page
        chrome.tabs.create({
            url: '/info.html'
        });
    });
});

// Offset note color
function offsetColor(note) {
    if (document.getElementById(note).className == 'wkey') {
        document.getElementById(note).style.backgroundColor = '#EBE7DA';
    } else {
        document.getElementById(note).style.backgroundColor = '#505054';
    }   
}

//Correct note color
function correctColor(note) {
    if (document.getElementById(note).className == 'wkey') {
        document.getElementById(note).style.backgroundColor = 'cornsilk';
    } else {
        document.getElementById(note).style.backgroundColor = 'black';
    }
}

// Configure note string depending on octave
function config(note, octaveVal = octave) {
    let nextOctave = octaveVal + 1;
    if (note.includes('n')) {
        // Remove 'n' from this ID
        note = note.slice(0, -1);
        return note + nextOctave.toString();
    } else {
        return note + octaveVal.toString();
    }
} 
