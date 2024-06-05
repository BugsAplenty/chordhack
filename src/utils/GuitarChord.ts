import { Chord } from '@tonaljs/chord';
import { ChordType, ChordQuality } from '@tonaljs/chord-type';
import tunings from './tunings';
import { Note, Interval } from 'tonal';

class GuitarChord implements ChordType {
  name: string;
  notes: string[];
  intervals: string[];
  tonic: string | null;
  type: string;
  pitches: (string | null)[];
  tuning: string;
  tab: { [GuitarString: string]: string };
  stringNotes: { [GuitarString: string]: string };
  quality: ChordQuality;
  aliases: string[];
  empty: boolean;
  setNum: number;
  chroma: string;
  normalized: string;

  constructor(chord: Chord, tuning: string = 'standard') {
    this.name = chord.name;
    this.notes = chord.notes;
    this.intervals = chord.intervals;
    this.tonic = chord.tonic;
    this.type = chord.type;
    this.quality = chord.quality;
    this.aliases = chord.aliases;
    this.empty = chord.empty;
    this.setNum = chord.setNum;
    this.chroma = chord.chroma;
    this.normalized = chord.normalized;
    this.tuning = tuning;
    this.tab = {};
    this.stringNotes = {};
    this.generateTabsAndNotes();
  }

  generateTabsAndNotes(): void {
    const strings = tunings[this.tuning];
    const chordNotes = this.notes;
    const tab: { [GuitarString: string]: string } = {};
    const stringNotes: { [GuitarString: string]: string } = {};

    const isValidChord = this.dfs(strings, chordNotes, tab, stringNotes, 0, 0, -1);

    if (isValidChord) {
      this.tab = tab;
      this.stringNotes = stringNotes;
    } else {
      this.tab = {};
      this.stringNotes = {};
    }
  }

  dfs(strings: string[], chordNotes: string[], tab: { [GuitarString: string]: string }, stringNotes: { [GuitarString: string]: string }, stringIndex: number, startFret: number, minFret: number): boolean {
    if (stringIndex >= strings.length) {
        return this.isValidChord(chordNotes, stringNotes);
    }

    const stringName = strings[stringIndex];
    const openNote = Note.pitchClass(stringName);
    const tonicNote = Note.pitchClass(this.tonic!);
    const interval = Interval.distance(openNote, tonicNote);
    const startingFret = Math.max(0, parseInt(interval));

    for (let fret = startingFret; fret <= startingFret + 4; fret++) {
        const note = Note.transpose(stringName, `${fret}m`);
        const noteWithoutOctave = Note.pitchClass(note); // Strip pitch information
        if (chordNotes.includes(noteWithoutOctave)) {
            tab[stringName] = fret.toString();
            stringNotes[stringName] = note;
            const newMinFret = minFret === -1 ? fret : minFret; // Set the first found fret as the minimum fret
            if (this.dfs(strings, chordNotes, tab, stringNotes, stringIndex + 1, newMinFret, newMinFret)) {
                return true;
            }
            tab[stringName] = 'x'; // Backtrack
            stringNotes[stringName] = ''; // Backtrack
        }
    }

    // Skip the current string and continue the search
    return this.dfs(strings, chordNotes, tab, stringNotes, stringIndex + 1, startFret, minFret);
}


  isValidChord(chordNotes: string[], stringNotes: { [GuitarString: string]: string }): boolean {
    const playedNotes = Object.values(stringNotes).map(note => Note.pitchClass(note));
    const chordNotesSet = new Set(chordNotes);
    const playedNotesSet = new Set(playedNotes);
    return chordNotesSet.size === playedNotesSet.size && [...chordNotesSet].every(note => playedNotesSet.has(note));
  }

  getPlayedNotes(): string[] {
    const playedNotes: string[] = [];

    Object.keys(this.tab).forEach((stringName) => {
      const fret = this.tab[stringName];
      if (fret !== 'x') {
        const note = Note.transpose(stringName, `${parseInt(fret)}m`);
        playedNotes.push(note);
      }
    });

    return playedNotes;
  }
}

export default GuitarChord;
