// src/__tests__/GuitarChord.test.js
import { Chord } from 'tonal';
import GuitarChord from '../utils/GuitarChord';

describe('GuitarChord', () => {
    const chords = ['Cmaj7', 'Dm7', 'E7', 'Fmaj7', 'Gdim', 'Aaug', 'Bm7'];

    chords.forEach(chordName => {
        test(`should generate correct tab shape for ${chordName} chord`, () => {
            const chord = new GuitarChord(chordName);
            const expectedNotes = Chord.get(chordName).notes;
            console.log(`Chord: ${chordName}`);
            console.log(`Chord Notes: ${expectedNotes.join(',')}`);
            console.log(`Chord Tab: ${chord.tab}`);

            const shapeNotes = new Set(chord.notes);

            console.log(`Unique Notes: ${expectedNotes.join(',')}`);
            console.log(`Shape Notes: ${Array.from(shapeNotes).join(',')}`);

            expect(chord.tab).not.toBeNull();
            expect(shapeNotes.size).toBe(expectedNotes.length);
        });
    });
});
