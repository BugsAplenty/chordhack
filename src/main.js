import * as Tone from "tone";
import { Scale, Chord, Note, ScaleType } from "tonal";
import GuitarChord from "./utils/GuitarChord.js";

// Audio Context
async function startAudioContext() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Audio context started');
    }
}

// Scale and Key Selection
function initializeSelectors() {
    const scaleSelect = document.getElementById('scale');
    const keySelect = document.getElementById('key');

    populateScaleOptions(scaleSelect);
    populateKeyOptions(keySelect);

    scaleSelect.addEventListener('change', updateChordsAndDisplay);
    keySelect.addEventListener('change', updateChordsAndDisplay);

    updateChordsAndDisplay(); // Initialize with default values
}

function populateScaleOptions(scaleSelect) {
    scaleSelect.innerHTML = '';
    ScaleType.all().forEach(scaleType => {
        const option = document.createElement('option');
        option.value = scaleType.name;
        option.textContent = scaleType.name;
        scaleSelect.appendChild(option);
    });
}

function populateKeyOptions(keySelect) {
    keySelect.innerHTML = '';
    Note.names().forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        keySelect.appendChild(option);
    });
}

function updateChordsAndDisplay() {
    const scaleSelect = document.getElementById('scale');
    const keySelect = document.getElementById('key');
    const scale = scaleSelect.value;
    const key = keySelect.value;

    if (!scale || !key) {
        console.error('Key or scale not selected');
        return;
    }

    displayChords(scale, key);
}

// Chord Display
function displayChords(scale, key) {
    const chordsContainer = document.getElementById('chords-container');
    chordsContainer.innerHTML = '';

    const scaleNotes = Scale.get(`${key} ${scale}`).notes;
    if (!scaleNotes.length) {
        console.error(`No notes found for scale: ${scale} and key: ${key}`);
        return;
    }

    const chords = categorizeChords(scaleNotes, scale);

    Object.entries(chords).forEach(([fingerCount, chordGroup]) => {
        if (chordGroup.length > 0) {
            addChordsToContainer(chordsContainer, chordGroup, `${capitalize(fingerCount)} Chords`);
        }
    });
}

function categorizeChords(scaleNotes, scale) {
    const chords = {
        '2-finger': [],
        '3-finger': [],
        '4-finger': [],
        extended: []
    };

    scaleNotes.forEach(root => {
        const chordTypes = Scale.scaleChords(`${scale}`);
        chordTypes.forEach(type => {
            const tonalChord = Chord.getChord(type, root);
            if (tonalChord.symbol) {
                const guitarChord = new GuitarChord(root, tonalChord.symbol, tonalChord.intervals, tonalChord.notes);
                const shape = guitarChord.tab;
                if (shape) {
                    const fingers = shape.split('').filter(f => f !== 'x').length;
                    if (fingers === 2) chords['2-finger'].push(guitarChord);
                    else if (fingers === 3) chords['3-finger'].push(guitarChord);
                    else if (fingers === 4) chords['4-finger'].push(guitarChord);
                    else if (fingers > 4) chords.extended.push(guitarChord);
                }
            }
        });
    });

    return chords;
}

function addChordsToContainer(container, chords, title) {
    const groupElement = document.createElement('div');
    groupElement.className = 'chord-group';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    groupElement.appendChild(titleElement);

    const chordList = document.createElement('div');
    chordList.className = 'chord-list';
    groupElement.appendChild(chordList);

    chords.forEach(chord => {
        const chordElement = createChordElement(chord);
        chordElement.onclick = async () => {
            await startAudioContext();
            playChordOrArpeggio(chord);
        };
        chordList.appendChild(chordElement);
    });

    container.appendChild(groupElement);
}

function createChordElement(chord) {
    const chordElement = document.createElement('div');
    chordElement.className = 'chord';
    chordElement.innerHTML = `<div>${chord.root} ${chord.type}</div><div class="tab">${chord.formatTab()}</div>`;
    return chordElement;
}

// Scale Playback
async function playScale() {
    const scaleSelect = document.getElementById('scale');
    const keySelect = document.getElementById('key');
    const scale = scaleSelect.value;
    const key = keySelect.value;
    await startAudioContext();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();

    const scaleNotes = Scale.get(`${key} ${scale}`).notes;
    const scaleNotesWithOctaves = getScaleNotesWithOctaves(scaleNotes);

    const palindromicNotes = [...scaleNotesWithOctaves, ...scaleNotesWithOctaves.slice(0, -1).reverse()];

    console.log(`Playing scale: ${palindromicNotes.join(', ')}`);

    palindromicNotes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.2);
    });
}

function getScaleNotesWithOctaves(scaleNotes) {
    const scaleNotesWithOctaves = [];
    let currentOctave = 4;

    scaleNotes.forEach((note, index) => {
        if (index > 0) {
            const prevNote = scaleNotes[index - 1];
            const prevFreq = Note.freq(`${prevNote}${currentOctave}`);
            const currentFreq = Note.freq(`${note}${currentOctave}`);

            if (currentFreq < prevFreq) {
                currentOctave++;
            }
        }
        scaleNotesWithOctaves.push(`${note}${currentOctave}`);
    });

    return scaleNotesWithOctaves;
}

// Chord/Arpeggio Playback
function getOctave(note, key) {
    const noteIndex = Note.names().indexOf(note);
    const keyIndex = Note.names().indexOf(key);
    const octaveOffset = Math.floor((noteIndex - keyIndex) / 12);
    return 4 + octaveOffset;
}

function playChordOrArpeggio(chord) {
    const playMode = document.querySelector('input[name="playMode"]:checked').value;
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();
    const keySelect = document.getElementById('key');
    const key = keySelect.value;

    const chordNotes = chord.notes.map(note => `${note}${getOctave(note, key)}`);

    if (playMode === 'chord') {
        synth.triggerAttackRelease(chordNotes, "8n", now);
    } else {
        chordNotes.forEach((note, index) => {
            synth.triggerAttackRelease(note, "8n", now + index * 0.25);
        });
    }
}

// Utility Functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event Listeners
window.initializeSelectors = initializeSelectors;
window.displayChords = displayChords;
window.playScale = playScale;

window.addEventListener('click', startAudioContext);
window.addEventListener('keydown', startAudioContext);

window.addEventListener('load', initializeSelectors);
