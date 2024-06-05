import * as Tone from "tone";
import { Scale, Note, ScaleType, Chord, Interval } from "tonal";
import tunings from "./utils/tunings.js";
import GuitarChord from './utils/GuitarChord.ts';

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
    const tuningSelect = document.getElementById('tuning');
    populateScaleOptions(scaleSelect);
    populateTonicOptions(tonicSelect);
    populateTuningOptions(tuningSelect);
    scaleSelect.addEventListener('change', handleScaleChange);
    tonicSelect.addEventListener('change', handleTonicChange);
    tuningSelect.addEventListener('change', handleTuningChange);
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

function populateTuningOptions(tuningSelect) {
    tuningSelect.innerHTML = '';
    Object.keys(tunings).forEach(tuning => {
        const option = document.createElement('option');
        option.value = tuning;
        option.textContent = tuning.charAt(0).toUpperCase() + tuning.slice(1);
        tuningSelect.appendChild(option);
    });
}

function handleScaleChange() {
    updateChordsAndDisplay();
}

function handleTonicChange() {
    updateChordsAndDisplay();
}

function handleTuningChange() {
    updateChordsAndDisplay();
}

function updateChordsAndDisplay() {
    const scaleSelect = document.getElementById('scale');
    const tonicSelect = document.getElementById('tonic');
    const tuningSelect = document.getElementById('tuning');
    const scale = scaleSelect.value;
    const tonic = tonicSelect.value;
    const tuning = tuningSelect.value;
    if (!scale || !tonic) {
        console.error('Key or scale not selected');
        return;
    }
    displayChords(scale, tonic, tuning);
}

// Chord Display
function displayChords(scale, tonic, tuning) {
    const chordsContainer = document.getElementById('chords-container');
    chordsContainer.innerHTML = '';
    const scaleWithTonic = Scale.get(`${tonic} ${scale}`);
    const chords = generateChordsForScale(scaleWithTonic, tuning);
    Object.entries(chords).forEach(([chordType, chordGroup]) => {
        if (chordGroup.length > 0) {
            addChordsToContainer(chordsContainer, chordGroup, `${capitalize(chordType)}`);
        }
    });
}

function getIntervalsFromScale(scale, startIndex, count) {
    let result = [];
    const maxIntervals = scale.notes.length;
    for (let i = 0; i < count; i++) {
        let index = (startIndex + i * 2) % maxIntervals;
        result.push(scale.notes[index]);
    }
    return result;
}

function generateChordsForScale(scale, tuning) {
    let chords = { triads: [], seventhChords: [], ninthChords: [] };

    const generateChords = (count) => {
        scale.notes.forEach((_, index) => {
            const chordNotes = getIntervalsFromScale(scale, index, count);
            const detectedChord = Chord.detect(chordNotes);
            if (detectedChord.length > 0) {
                const chord = Chord.get(detectedChord[0]);
                const guitarChord = new GuitarChord(chord, tuning);
                switch (count) {
                    case 3:
                        chords.triads.push(guitarChord);
                        break;
                    case 4:
                        chords.seventhChords.push(guitarChord);
                        break;
                    case 5:
                        chords.ninthChords.push(guitarChord);
                        break;
                    default:
                        break;
                }
            }
        });
    };

    generateChords(3); // Generate triads
    generateChords(4); // Generate seventh chords
    generateChords(5); // Generate ninth chords

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
    chordElement.dataset.chord = JSON.stringify({
        name: chord.name,
        notes: chord.notes,
        intervals: chord.intervals,
        tonic: chord.tonic,
        type: chord.type,
        quality: chord.quality,
        aliases: chord.aliases,
        empty: chord.empty,
        setNum: chord.setNum,
        chroma: chord.chroma,
        normalized: chord.normalized,
        tuning: chord.tuning,
        tab: chord.tab,
        stringNotes: chord.stringNotes
    });
    chordElement.innerHTML = `<span>${chord.name}</span>`;
    return chordElement;
}

function handleChordClick(event) {
    const chordElement = event.target.closest('.chord');
    if (chordElement) {
        const chordData = JSON.parse(chordElement.dataset.chord);
        const chord = new GuitarChord(
            {
                name: chordData.name,
                notes: chordData.notes,
                intervals: chordData.intervals,
                tonic: chordData.tonic,
                type: chordData.type,
                quality: chordData.quality,
                aliases: chordData.aliases,
                empty: chordData.empty,
                setNum: chordData.setNum,
                chroma: chordData.chroma,
                normalized: chordData.normalized
            },
            chordData.tuning
        );
        // Pass the played notes to Tone.js or any other processing
        playChordOrArpeggio(chord.stringNotes);
    }
}

function playChordOrArpeggio(notes) {
    const playMode = document.querySelector('input[name="playMode"]:checked').value;
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const noteValues = Object.values(notes);

    if (playMode === 'chord') {
        noteValues.forEach(noteWithPitch => {
            synth.triggerAttackRelease(noteWithPitch, "2n");
        });
    } else if (playMode === 'arpeggio') {
        noteValues.forEach((noteWithPitch, index) => {
            if (noteWithPitch) { // Ensure the pitch is valid
                console.log(`Playing note: ${noteWithPitch} at time: ${Tone.now() + index * 0.5}`);
                synth.triggerAttackRelease(noteWithPitch, "8n", Tone.now() + index * 0.5);
            } else {
                console.error('Invalid note:', noteWithPitch);
            }
        });
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    startAudioContext();
    initializeSelectors();
});