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
    tab: { [GuitarString: string]: string };
    stringNotes: { [GuitarString: string]: string };
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
        this.tab = {};
        this.stringNotes = {};
        this.name = chord.name;
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
        const { bestDiagonal } = minimizeDiagonalSpan(this.semitoneDistanceMatrix);
        this.tab = {};
        this.stringNotes = {};
        for (let i = 0; i < bestDiagonal.length; i++) {
            const string = this.tuning[i];
            const fret = bestDiagonal[i];
            this.tab[string] = fret.toString();
            this.stringNotes[string] = Note.transpose(string, Interval.fromSemitones(fret));
        }
    }

    isWithinFretSpan(fret1: number, fret2: number): boolean {
        return Math.abs(fret1 - fret2) <= 3;
    }

    isCompleteChord(): boolean {
        const playedNotes = Object.values(this.stringNotes).map(note => Note.pitchClass(note));
        const chordNotesSet = new Set(this.notes);
        const playedNotesSet = new Set(playedNotes);
        return chordNotesSet.size === playedNotesSet.size && [...chordNotesSet].every(note => playedNotesSet.has(note));
    }

    isPlayableChord(): boolean {
        const fretValues = this.tuning.map(guitarString => {
            return Number(this.tab[guitarString]);
        });
        return this.allFretsInSpan(fretValues) && !this.shapeHasStringGaps(fretValues);
    }

    allFretsInSpan(fretValues: number[]): boolean {
        const filteredFretValues = fretValues.filter(value => !isNaN(value));
        const minFret = Math.min(...filteredFretValues);
        const maxFret = Math.max(...filteredFretValues);
        return Math.abs(minFret - maxFret) <= 3;
    }

    shapeHasStringGaps(fretValues: number[]): boolean {
        let hasNaNsBetweenNumbers = false;
        let lastNumberIndex = -1;

        for (let i = 0; i < fretValues.length; i++) {
            if (!isNaN(fretValues[i])) {
                if (lastNumberIndex !== -1 && i - lastNumberIndex > 1) {
                    hasNaNsBetweenNumbers = true;
                    break;
                }
                lastNumberIndex = i;
            }
        }
        return hasNaNsBetweenNumbers;
    }

    isValidChord(): boolean {
        return this.isCompleteChord() && this.isPlayableChord();
    }
}

export default GuitarChord;
