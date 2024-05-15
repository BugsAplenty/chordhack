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
        
        const stringTunings = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

        const rootNote = noteMap[this.root];
        return this.tab.map((fret, stringIndex) => {
            if (fret === 'x') return null;
            const stringNote = Tone.Frequency(stringTunings[stringIndex]).transpose(fret).toNote();
            return stringNote;
        }).filter(note => note !== null);
    }
}
