// src/utils/generateChordTab.js
import { Note } from 'tonal';

function generateChordTab(guitarNeck, notes) {
    const maxFret = 12;
    const maxIterations = 1000; // Set a reasonable limit for iterations
    const visited = new Set();
    const stack = [[-1, -1, -1, -1, -1, -1]]; // Start with open strings
    let bestShape = null;
    let minFretSpan = Infinity;
    let iterations = 0;

    const isFeasibleShape = (shape) => {
        const shapeNotes = new Set(guitarNeck.getNotesAtFrets(shape).map(Note.pitchClass));
        return shapeNotes.size === notes.length;
    };

    while (stack.length > 0 && iterations < maxIterations) {
        const shape = stack.pop();
        const shapeKey = shape.join(',');

        if (visited.has(shapeKey)) continue;
        visited.add(shapeKey);

        if (isFeasibleShape(shape)) {
            const frets = shape.filter(f => f !== -1);
            const maxFret = Math.max(...frets);
            const minFret = Math.min(...frets);
            const fretSpan = maxFret - minFret;
            if (fretSpan <= 3 && minFret < minFretSpan) { // Ensure fret span is within 4 and prioritize lower frets
                bestShape = shape;
                minFretSpan = minFret;
                if (minFretSpan === 0) break; // Early exit if minimal span is found
            }
        }

        for (let string = 0; string < 6; string++) { // Start iterating from the lowest string
            if (shape[string] < maxFret) {
                const newShape = shape.slice();
                if (newShape[string] === -1) newShape[string] = 0; // Treat -1 (open string) as 0 fret
                newShape[string]++;
                if (newShape[string] <= maxFret) {
                    stack.push(newShape);
                }
            }
        }

        iterations++;
    }

    return bestShape ? bestShape.map(fret => (fret === -1 ? 'x' : fret)).join('-') : null;
}

export default generateChordTab;
