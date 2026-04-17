import { InjectionToken } from '@angular/core';
import { type NoteRepository } from './note-repository';

export const NOTE_REPOSITORY = new InjectionToken<NoteRepository>('NoteRepository');
