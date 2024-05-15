import { Scale } from '../classes/Scale.js';
import { chordPatterns } from './chordPatterns.js';

// Define scales
export const scales = {
    major: new Scale('Major', ["C", "D", "E", "F", "G", "A", "B"], [
        chordPatterns.maj, chordPatterns.min, chordPatterns.min,
        chordPatterns.maj, chordPatterns.maj, chordPatterns.min, chordPatterns.dim
    ], [
        chordPatterns.maj7, chordPatterns.m7, chordPatterns.m7,
        chordPatterns.maj7, chordPatterns.dominant7, chordPatterns.m7, chordPatterns.m7b5
    ]),
    minor: new Scale('Minor', ["C", "D", "Eb", "F", "G", "Ab", "Bb"], [
        chordPatterns.min, chordPatterns.dim, chordPatterns.maj,
        chordPatterns.min, chordPatterns.min, chordPatterns.maj, chordPatterns.maj
    ], [
        chordPatterns.m7, chordPatterns.m7b5, chordPatterns.maj7,
        chordPatterns.m7, chordPatterns.m7, chordPatterns.maj7, chordPatterns.dominant7
    ]),
    // Define other scales similarly
};
