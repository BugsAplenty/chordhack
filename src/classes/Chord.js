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

        const reverseNoteMap = Object.entries(noteMap).reduce((acc, [note, midi]) => {
            acc[midi] = note;
            return acc;
        }, {});

        const rootMidi = noteMap[this.root];
        const intervals = this.type.intervals;

        const chordNotes = intervals.map(interval => {
            const noteMidi = (rootMidi + interval) % 12;
            return reverseNoteMap[noteMidi];
        });

        return chordNotes;
    }
}
