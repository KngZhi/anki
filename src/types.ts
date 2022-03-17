export type NotedId = number
export type ModelName = string
export type DeckName = string
export type Fields = Record<string, string>
export type Tag = string
export type Tags = Array<Tag>

export interface Note {
    deckName: DeckName;
    tags: Tags;
    options?: {
        allowDuplicate: boolean;
        duplicateScope?: 'deckName' | unknown;
    }
    fields: Fields;
    modelName: ModelName;
}

export type UpdateNote = Omit<Note, 'deckName' | 'modelName'> & { id: NotedId }

export interface OmniFocusData {
    name: string;
    note: string;
    tags: Tags;
}
