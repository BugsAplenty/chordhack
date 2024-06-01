// src/utils/GuitarChord.ts
import { Chord } from '@tonaljs/chord';
import { ChordType, ChordQuality } from '@tonaljs/chord-type';
import tunings from './tunings';

class GuitarChord implements ChordType {
  name: string;
  notes: string[];
  intervals: string[];
  tonic: string | null;
  type: string;
  pitches: (string | null)[];
  tuning: string;
  tabNotation: string;
  quality: ChordQuality;
  aliases: string[];
  empty: boolean;
  setNum: number;
  chroma: string;
  normalized: string;

  constructor(chord: Chord, tuning: string = 'standard') {
    this.name = chord.name;
    this.notes = chord.notes;
    this.intervals = chord.intervals;
    this.tonic = chord.tonic;
    this.type = chord.type;
    this.quality = chord.quality;
    this.aliases = chord.aliases;
    this.empty = chord.empty;
    this.setNum = chord.setNum;
    this.chroma = chord.chroma;
    this.normalized = chord.normalized;
    this.pitches = chord.notes.map(note => note); // Assuming pitches are the same as notes for simplicity
    this.tuning = tuning;
    this.tabNotation = this.generateTabNotation();
  }

  generateTabNotation(): string {
    const strings = tunings[this.tuning];
    let tab = '';

    for (let i = 0; i < strings.length; i++) {
      const pitch = this.pitches[i] || 'x'; // 'x' for muted strings
      tab += `${strings[i]} - ${pitch} -\n`;
    }

    return tab;
  }
}

export default GuitarChord;
