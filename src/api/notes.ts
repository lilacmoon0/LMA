import { endpoints, http } from './client'
import type { Note, Paginated } from '../types'

export type CreateNotePayload = Pick<Note, 'title' | 'content' | 'background_color'>
export type UpdateNotePayload = Partial<CreateNotePayload>

export async function fetchNotes() {
  const res = await http.get<Paginated<Note> | Note[]>(endpoints.notes)
  return Array.isArray(res) ? res : (res?.results ?? [])
}

export async function createNote(payload: CreateNotePayload) {
  return http.post<Note>(endpoints.notes, payload)
}

export async function updateNote(id: number, payload: UpdateNotePayload) {
  return http.patch<Note>(`${endpoints.notes}${id}/`, payload)
}

export async function deleteNote(id: number) {
  return http.delete<void>(`${endpoints.notes}${id}/`)
}
