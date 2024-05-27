import * as Tone from "tone";
import { Scale, Chord, Note, ScaleType, Key } from "tonal";
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
    const tonicSelect = document.getElementById('tonic');

    populateScaleOptions(scaleSelect);
    populateTonicOptions(tonicSelect);

    scaleSelect.addEventListener('change', handleScaleChange);
    tonicSelect.addEventListener('change', handleTonicChange);

    updateChordsAndDisplay(); // Initialize with default values
}

function populateScaleOptions(scaleSelect) {
    scaleSelect.innerHTML = '';
    const scaleTypes = ScaleType.all();
    for (let i = 0; i < scaleTypes.length; i++) {
        const scaleType = scaleTypes[i];
        const option = document.createElement('option');
        option.value = scaleType.name;
        option.textContent = scaleType.name;
        scaleSelect.appendChild(option);
    }
}

function populateTonicOptions(tonicSelect) {
    tonicSelect.innerHTML = '';
    const noteNames = Note.names();
    for (let i = 0; i < noteNames.length; i++) {
        const note = noteNames[i];
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        tonicSelect.appendChild(option);
    }
}

function handleScaleChange() {
    updateChordsAndDisplay();
}

function handleTonicChange() {
    updateChordsAndDisplay();
}

function updateChordsAndDisplay() {
    const scaleSelect = document.getElementById('scale');
    const tonicSelect = document.getElementById('tonic');
    const scale = scaleSelect.value;
    const tonic = tonicSelect.value;

    if (!scale || !tonic) {
        console.error('Key or scale not selected');
        return;
    }

    displayChords(scale, tonic);
}

// Chord Display
function displayChords(scale, tonic) {
    const chordsContainer = document.getElementById('chords-container');
    chordsContainer.innerHTML = '';

    const scaleNotes = Scale.get(`${tonic} ${scale}`).notes;
    if (!scaleNotes.length) {
        console.error(`No notes found for scale: ${scale} and tonic: ${tonic}`);
        return;
    }

    const chords = generateChordsForScale(scaleNotes, scale, tonic);

    Object.entries(chords).forEach(([chordType, chordGroup]) => {
        if (chordGroup.length > 0) {
            addChordsToContainer(chordsContainer, chordGroup, `${capitalize(chordType)}`);
        }
    });
}

function getIntervalsFromScale(array, startIndex, count) {
    let result = [];
    for (let i = 0; i < count * 2; i += 2) { // Increment by 2 to "skip" every other element
        // Calculate the index considering wrapping
        let index = (startIndex + i) % array.length;
        result.push(array[index]);
    }
    return result;
}

function generateChordsForScale(scaleNotes) {
    let chords = { triads: [], seventhChords: [], ninthChords: [] };
    scaleNotes.forEach((root, index) => {
        // For triads
        chords.triads.push(new GuitarChord(root, getIntervalsFromScale(scaleNotes, index, 3)));
        // For seventh chords
        chords.seventhChords.push(new GuitarChord(root, getIntervalsFromScale(scaleNotes, 4)));
        // For ninth chords
        chords.ninthChords.push(new GuitarChord(root, getIntervalsFromScale(scaleNotes, index, 5)));
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
        chordElement.addEventListener('click', handleChordClick);
        chordList.appendChild(chordElement);
    });

    container.appendChild(groupElement);
}

function createChordElement(chord) {
    const chordElement = document.createElement('div');
    chordElement.className = 'chord';
    chordElement.dataset.chord = JSON.stringify(chord);
    chordElement.innerHTML = `<div>${chord.root} ${chord.type}</div><div class="tab">${chord.formatTab()}</div>`;
    return chordElement;
}

async function handleChordClick(event) {
    const chordElement = event.target.closest('.chord');
    const chordData = JSON.parse(chordElement.dataset.chord);
    const guitarChord = new GuitarChord(chordData.root, chordData.type, chordData.intervals, chordData.notes);
    await startAudioContext();
    playChordOrArpeggio(guitarChord);
}

// Scale Playback
async function playScale() {
    const scaleSelect = document.getElementById('scale');
    const tonicSelect = document.getElementById('tonic');
    const scale = scaleSelect.value;
    const tonic = tonicSelect.value;
    await startAudioContext();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();

    const scaleNotes = Scale.get(`${tonic} ${scale}`).notes;
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
function getOctave(note, tonic) {
    const noteIndex = Note.names().indexOf(note);
    const tonicIndex = Note.names().indexOf(tonic);
    const octaveOffset = Math.floor((noteIndex - tonicIndex) / 12);
    return 4 + octaveOffset;
}

function playChordOrArpeggio(chord) {
    const playMode = document.querySelector('input[name="playMode"]:checked').value;
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();
    const tonicSelect = document.getElementById('tonic');
    const tonic = tonicSelect.value;

    const chordNotes = chord.type.map(note => `${note}${getOctave(note, tonic)}`);

    if (playMode === 'chord') {
        synth.triggerAttackRelease(chordNotes, "8n", now);
    } else {
        // Play arpeggio in the order of low string to high string
        const tab = chord.tab.split('-');
        const stringOrder = [5, 4, 3, 2, 1, 0]; // Order of strings from low E to high E
        const arpeggioNotes = stringOrder.map(stringIndex => {
            const fret = tab[stringIndex];
            if (fret !== 'x' && fret !== '0') {
                return `${chord.notes[stringIndex]}${getOctave(chord.notes[stringIndex], tonic)}`;
            }
            return null;
        }).filter(note => note !== null);

        arpeggioNotes.forEach((note, index) => {
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
window.addEventListener('tonicdown', startAudioContext);

window.addEventListener('load', initializeSelectors);