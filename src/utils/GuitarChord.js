import GuitarNeck from './GuitarNeck';
import generateChordTab from './utils';

class GuitarChord {
    constructor(root, type, intervals, notes) {
        this.root = root;
        this.type = type;
        this.intervals = intervals;
        this.notes = notes;
        this.guitarNeck = new GuitarNeck();
        // this.tab = generateChordTab(this.guitarNeck, this.notes); // Call the external function
        this.tab = '';
    }

    formatTab() {
        return this.tab.split('').map(fret => (fret === 'x' ? 'x' : fret)).join('');
    }
}

export default GuitarChord;
