import { Chord } from '@tonaljs/chord';
import { ChordType, ChordQuality } from '@tonaljs/chord-type';
import { Note, Interval } from 'tonal';
import minimizeDiagonalSpan from './minimizeDiagonalSpan.js';

class GuitarChord implements ChordType {
    name: string;
    notes: string[];
    intervals: string[];
    tonic: string | null;
    type: string;
    tuning: string[];
    tabs: { [GuitarString: string]: string[] } [];
    stringNotes: { [GuitarString: string]: string[] } [];
    tabTexts: string [];
    quality: ChordQuality;
    aliases: string[];
    empty: boolean;
    setNum: number;
    chroma: string;
    normalized: string;
    semitoneDistanceMatrix: number[][];
    pitches: (string | null)[];

    constructor(chord: Chord, tuning: string[]) {
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
        this.tabTexts = [];
        this.tabs = [];
        this.stringNotes = [];
        this.name = chord.name;
        this.semitoneDistanceMatrix = [];
        this.generateSemitoneDistanceMatrix();
        this.generateTabsAndNotes();
    }

    generateSemitoneDistanceMatrix(): void {
        this.semitoneDistanceMatrix = [];
        for (let i = 0; i < this.tuning.length; i++) {
            this.semitoneDistanceMatrix[i] = [];
            for (let j = 0; j < this.notes.length; j++) {
                this.semitoneDistanceMatrix[i][j] = Interval.semitones(Interval.distance(this.tuning[i], this.notes[j]));
            }
        }
    }

    generateTabsAndNotes(): void {
        const validDiagonals = minimizeDiagonalSpan(this.semitoneDistanceMatrix);
        validDiagonals.forEach(({ diagonal, rowIndices }, shapeIndex) => {
            let tab = {};
            let stringNote = {};
            for (let i = 0; i < diagonal.length; i++) {
                const guitarString = this.tuning[rowIndices[i]];
                const fret = diagonal[i];
                tab[guitarString] = fret;
                stringNote[guitarString] = Note.transpose(guitarString, Interval.fromSemitones(fret));
                
            }
            this.tabs.push(tab);
            this.stringNotes.push(stringNote);
            this.tabTexts.push(this.tab2Text(tab));
        });
    }
    tab2Text(tab: { [GuitarString: string]: string }): string {
        return this.tuning.map(string => `${string} - ${tab.hasOwnProperty(string) ? tab[string] : 'x'}`).join('\n');
    }
}

export default GuitarChord;