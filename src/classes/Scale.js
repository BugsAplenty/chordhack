import { Chord } from './Chord.js';

export class Scale {
    constructor(name, notes, triads, sevenths) {
        this.name = name;
        this.notes = notes;
        this.triads = triads;
        this.sevenths = sevenths;
    }

    getChords(key) {
        const keyIndex = this.notes.indexOf(key);
        const chords = this.notes.map((note, index) => {
            const triadType = this.triads[(keyIndex + index) % this.triads.length];
            const seventhType = this.sevenths[(keyIndex + index) % this.sevenths.length];
            return {
                triad: new Chord(note, triadType.type, triadType.tab),
                seventh: new Chord(note, seventhType.type, seventhType.tab)
            };
        });
        return chords;
    }
}
