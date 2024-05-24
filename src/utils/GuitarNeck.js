// src/utils/GuitarNeck.js
import { Note, Interval } from 'tonal';

const standardTuning = ['E', 'A', 'D', 'G', 'B', 'E'];

class GuitarNeck {
    constructor(tuning = standardTuning) {
        this.tuning = tuning;
    }

    getNoteAtStringAndFret(stringIndex, fret) {
        const openStringNote = this.tuning[stringIndex];
        return Note.transpose(openStringNote, Interval.fromSemitones(fret));
    }

    getNotesAtFrets(frets) {
        return frets.map((fret, index) => {
            if (fret === 'x') return null;
            return this.getNoteAtStringAndFret(index, parseInt(fret, 10));
        }).filter(note => note !== null);
    }
}

export default GuitarNeck;
