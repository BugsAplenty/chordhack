import * as Tone from "tone";
import { Scale, Note, ScaleType, Chord, Interval } from "tonal";
import tunings from "./utils/tunings.js";
import GuitarChord from './utils/GuitarChord.ts';
import { transpose } from '@tonaljs/note';
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
  scale.notes.forEach((root, index) => {
    // For triads
    const triadChordNotes = getIntervalsFromScale(scale, index, 3);
    const triadChord = Chord.get(Chord.detect(triadChordNotes)[0]);
    chords.triads.push(new GuitarChord(triadChord, tuning));
    
    // For seventh chords
    const seventhChordNotes = getIntervalsFromScale(scale, index, 4);
    const seventhChord = Chord.get(Chord.detect(seventhChordNotes)[0]);
    chords.seventhChords.push(new GuitarChord(seventhChord, tuning));
    
    // For ninth chords
    const ninthChordNotes = getIntervalsFromScale(scale, index, 5);
    const ninthChord = Chord.get(Chord.detect(ninthChordNotes)[0]);
    chords.ninthChords.push(new GuitarChord(ninthChord, tuning));
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
  chordElement.innerHTML = `<div>${chord.name}</div><div class="tab">${chord.tabNotation}</div>`;
  return chordElement;
}

async function handleChordClick(event) {
  const chordElement = event.target.closest('.chord');
  const chordData = JSON.parse(chordElement.dataset.chord);
  const guitarChord = new GuitarChord(chordData, chordData.tuning);
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

  const chordNotes = chord.pitches.map(note => `${note}${getOctave(note, tonic)}`);

  if (playMode === 'chord') {
    synth.triggerAttackRelease(chordNotes, "8n", now);
  } else {
    // Play arpeggio in the order of low string to high string
    const tab = chord.tabNotation.split('-');
    const stringOrder = [5, 4, 3, 2, 1, 0]; // Order of strings from low E to high E
    const arpeggioNotes = stringOrder.map(stringIndex => {
      const fret = tab[stringIndex];
      if (fret !== 'x' && fret !== '0') {
        return `${chord.pitches[stringIndex]}${getOctave(chord.pitches[stringIndex], tonic)}`;
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
