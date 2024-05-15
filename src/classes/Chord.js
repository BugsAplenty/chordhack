import * as Tone from 'tone';

export class Chord {
    constructor(root, type, tab) {
        this.root = root;
        this.type = type;
        this.tab = tab;
    }

    getNotes() {
        const noteMap = {
            'C': 0, 'C#': 1, 'Db': 1,
            'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6,
            'G': 7, 'G#': 8, 'Ab': 8,
            'A': 9, 'A#': 10, 'Bb': 10,
            'B': 11
        };
        const baseNote = noteMap[this.root];
        // Adjust octave to ensure notes are in a hearable range (e.g., starting from the fourth octave)
        const baseOctave = 4 * 12; // MIDI note number for the fourth octave
        return this.type.intervals.map(interval => Tone.Frequency(baseOctave + baseNote + interval, 'midi').toNote());
    }
}
