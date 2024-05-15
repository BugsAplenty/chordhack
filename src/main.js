import { scales } from './data/scales.js';
import * as Tone from 'tone';

// Ensure the Tone.js context is started on user interaction
async function startAudioContext() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Audio context started');
    }
}

function updateKeys() {
    const scaleSelect = document.getElementById('scale');
    const scale = scaleSelect.value;
    console.log(`Selected scale: ${scale}`);
    console.log(`Available scales: ${Object.keys(scales)}`);
    const keySelect = document.getElementById('key');
    keySelect.innerHTML = '';

    if (!scales[scale]) {
        console.error(`Scale not found: ${scale}`);
        return;
    }

    scales[scale].notes.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        keySelect.appendChild(option);
    });
    displayChords();
}

function displayChords() {
    const scaleSelect = document.getElementById('scale');
    const scale = scaleSelect.value;
    const keySelect = document.getElementById('key');
    const key = keySelect.value;
    const chordsContainer = document.getElementById('chords-container');
    chordsContainer.innerHTML = '';
    const chords = scales[scale].getChords(key);

    const threeFingerChords = chords.filter(chordObj => chordObj.triad.tab.filter(fret => fret !== 'x').length === 3);
    const fourFingerChords = chords.filter(chordObj => chordObj.triad.tab.filter(fret => fret !== 'x').length === 4);
    const fiveFingerChords = chords.filter(chordObj => chordObj.triad.tab.filter(fret => fret !== 'x').length === 5);

    addChordsToContainer(chordsContainer, threeFingerChords, '3-Finger Chords');
    addChordsToContainer(chordsContainer, fourFingerChords, '4-Finger Chords');
    addChordsToContainer(chordsContainer, fiveFingerChords, '5-Finger Chords');
}

function addChordsToContainer(container, chords, title) {
    const groupElement = document.createElement('div');
    groupElement.className = 'chord-group';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    groupElement.appendChild(titleElement);

    chords.forEach(chordObj => {
        const triadElement = createChordElement(chordObj.triad);
        triadElement.onclick = async () => {
            await startAudioContext();
            playChordOrArpeggio(chordObj.triad);
        };
        groupElement.appendChild(triadElement);

        const seventhElement = createChordElement(chordObj.seventh);
        seventhElement.onclick = async () => {
            await startAudioContext();
            playChordOrArpeggio(chordObj.seventh);
        };
        groupElement.appendChild(seventhElement);
    });

    container.appendChild(groupElement);
}

function createChordElement(chord) {
    const chordElement = document.createElement('div');
    chordElement.className = 'chord';
    chordElement.innerHTML = `<div>${chord.root}${chord.type.name}</div><div class="tab">${formatTab(chord.tab)}</div>`;
    return chordElement;
}

function formatTab(tab) {
    const strings = ['E', 'A', 'D', 'G', 'B', 'e'];
    return strings.map((string, index) => `${string} ---${tab[index]}---`).join('<br>');
}

async function playScale() {
    const scaleSelect = document.getElementById('scale');
    const scale = scaleSelect.value;
    const keySelect = document.getElementById('key');
    const key = keySelect.value;
    await startAudioContext();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();
    const scaleNotes = scales[scale].notes.map(note => `${note}4`);
    scaleNotes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.25);
    });
}

function playChordOrArpeggio(chord) {
    const playMode = document.querySelector('input[name="playMode"]:checked').value;
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();
    const chordNotes = chord.getNotes().map(note => `${note}4`);
    if (playMode === 'chord') {
        synth.triggerAttackRelease(chordNotes, "8n", now);
    } else {
        chordNotes.forEach((note, index) => {
            synth.triggerAttackRelease(note, "8n", now + index * 0.25);
        });
    }
}

// Attach functions to the window object
window.updateKeys = updateKeys;
window.displayChords = displayChords;
window.playScale = playScale;

// Add an event listener to resume the AudioContext on user interaction
window.addEventListener('click', startAudioContext);
window.addEventListener('keydown', startAudioContext);

// Ensure the keys are updated on page load
window.addEventListener('load', () => {
    updateKeys();
    const keySelect = document.getElementById('key');
    if (keySelect) {
        displayChords();
    }
});
