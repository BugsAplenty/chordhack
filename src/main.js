import * as Tone from 'tone';
import { Scale, Chord, Note, ScaleType } from 'tonal';



// Audio Context
async function startAudioContext() {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('Audio context started');
    }
}

// Scale and Key Selection
function updateKeys() {
    const scaleSelect = document.getElementById('scale');
    scaleSelect.innerHTML = '';

    ScaleType.all().forEach(scaleType => {
        const option = document.createElement('option');
        option.value = scaleType.name;
        option.textContent = scaleType.name;
        scaleSelect.appendChild(option);
    });

    const keySelect = document.getElementById('key');
    keySelect.innerHTML = '';

    const allNotes = Scale.get('C major').notes;

    allNotes.forEach(note => {
        const option = document.createElement('option');
        option.value = note;
        option.textContent = note;
        keySelect.appendChild(option);
    });

    displayChords();
}

// Chord Display
function displayChords() {
    const scaleSelect = document.getElementById('scale');
    const scale = scaleSelect.value;
    const keySelect = document.getElementById('key');
    const key = keySelect.value;
    const chordsContainer = document.getElementById('chords-container');
    chordsContainer.innerHTML = '';

    if (!key) {
        console.error('Key not selected');
        return;
    }

    const chords = Scale.get(`${key} ${scale}`).chords;
    if (!chords) {
        console.error(`No chords found for scale: ${scale} and key: ${key}`);
        return;
    }

    const threeFingerChords = filterChordsByFingers(chords, 3);
    const fourFingerChords = filterChordsByFingers(chords, 4);
    const fiveFingerChords = filterChordsByFingers(chords, 5);

    addChordsToContainer(chordsContainer, threeFingerChords, '3-Finger Chords');
    addChordsToContainer(chordsContainer, fourFingerChords, '4-Finger Chords');
    addChordsToContainer(chordsContainer, fiveFingerChords, '5-Finger Chords');
}

function filterChordsByFingers(chords, fingerCount) {
    return chords.filter(chord => Chord.get(chord).intervals.length === fingerCount);
}

function addChordsToContainer(container, chords, title) {
    const groupElement = document.createElement('div');
    groupElement.className = 'chord-group';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    groupElement.appendChild(titleElement);

    chords.forEach(chordName => {
        const chord = Chord.get(chordName);
        const chordElement = createChordElement(chord);
        chordElement.onclick = async () => {
            await startAudioContext();
            playChordOrArpeggio(chord);
        };
        groupElement.appendChild(chordElement);
    });

    container.appendChild(groupElement);
}

function createChordElement(chord) {
    const chordElement = document.createElement('div');
    chordElement.className = 'chord';
    chordElement.innerHTML = `<div>${chord.symbol}</div><div class="tab">${formatTab(chord.notes)}</div>`;
    return chordElement;
}

function formatTab(notes) {
    return notes.join(' ');
}

// Scale Playback
async function playScale() {
    const scaleSelect = document.getElementById('scale');
    const scale = scaleSelect.value;
    const keySelect = document.getElementById('key');
    const key = keySelect.value;
    await startAudioContext();

    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    const now = Tone.now();

    const scaleNotes = Scale.get(`${key} ${scale}`).notes;
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

    const palindromicNotes = [...scaleNotesWithOctaves, ...scaleNotesWithOctaves.slice(0, -1).reverse()];

    console.log(`Playing scale: ${palindromicNotes.join(', ')}`);

    palindromicNotes.forEach((note, index) => {
        synth.triggerAttackRelease(note, "8n", now + index * 0.2);
    });
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

// Event Listeners
window.updateKeys = updateKeys;
window.displayChords = displayChords;
window.playScale = playScale;

window.addEventListener('click', startAudioContext);
window.addEventListener('keydown', startAudioContext);

window.addEventListener('load', () => {
    updateKeys();
    const keySelect = document.getElementById('key');
    if (keySelect) {
        displayChords();
    }
});