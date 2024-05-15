import { Chord } from './Chord.js';

export class Scale {
    constructor(name, notes, triads, sevenths) {
        this.name = name;
        this.notes = notes;
        this.triads = triads;
        this.sevenths = sevenths;
    }

    getChords(key) {
        const noteMap = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11
        };

        const keyIndex = noteMap[key];
        const transposedNotes = this.notes.map(note => {
            const noteIndex = (noteMap[note] + keyIndex) % 12;
            return Object.keys(noteMap).find(key => noteMap[key] === noteIndex);
        });

        const chords = transposedNotes.map((note, index) => {
            const triadPattern = this.triads[index % this.triads.length];
            const seventhPattern = this.sevenths[index % this.sevenths.length];
            return {
                triad: new Chord(note, triadPattern, triadPattern.tab),
                seventh: new Chord(note, seventhPattern, seventhPattern.tab)
            };
        });

        return chords;
    }
}
