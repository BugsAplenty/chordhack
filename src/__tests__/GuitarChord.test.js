// src/__tests__/GuitarChord.test.js
import { Chord } from 'tonal';
import GuitarChord from '../utils/GuitarChord';

describe('GuitarChord', () => {
    const chords = ['Cmaj7', 'Dm7', 'E7', 'Fmaj7', 'Gdim', 'Aaug', 'Bm7'];

    chords.forEach(chordName => {
        test(`should generate correct tab shape for ${chordName} chord`, () => {
            const chordData = Chord.get(chordName);
            const { tonic: root, type, intervals, notes } = chordData;

            const guitarChord = new GuitarChord(root, type, intervals, notes);
            const expectedNotes = new Set(notes);

            console.log(`Chord: ${chordName}`);
            console.log(`Chord Notes: ${Array.from(expectedNotes).join(',')}`);
            console.log(`Chord Tab: ${guitarChord.tab}`);

            const shapeNotes = new Set(guitarChord.guitarNeck.getNotesAtFrets(guitarChord.tab.split('-').map(fret => fret === 'x' ? -1 : parseInt(fret))));

            console.log(`Unique Notes: ${Array.from(expectedNotes).join(',')}`);
            console.log(`Shape Notes: ${Array.from(shapeNotes).join(',')}`);

            expect(guitarChord.tab).not.toBeNull();
            expect(shapeNotes.size).toBe(expectedNotes.size);
        });
    });
});
