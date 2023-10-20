import { Entity, Relation, Tag, Vocabulary } from '@/model';
import { readJSONFile, writeJSONFile } from './utils';

export interface VocabularyStore {

  addEntity(entity: Entity): Promise<void>;

  removeEntity(entityOrId: Entity | string): Promise<void>;

  addRelation(relation: Relation): Promise<void>;

  removeRelation(relationOrId: Relation | string): Promise<void>;

  addTag(tag: Tag): Promise<void>;

  removeTag(tag: Tag): Promise<void>;

  getVocabulary(): Vocabulary;

}

export const loadVocabulary = (handle: FileSystemDirectoryHandle): Promise<VocabularyStore> => 

  new Promise(async resolve => {

    const fileHandle = await handle.getFileHandle('vocabulary.imarkus', { create: true });

    const file = await fileHandle.getFile();

    let { tags, entities, relations } = (await readJSONFile<Vocabulary>(file) || {

      tags: [],

      entities: [],

      relations: []

    });
    
    const addTag = (tag: Tag) => {
      if (!tags.includes(tag)) {
        tags = [...tags, tag];
        return writeJSONFile(fileHandle, { tags, entities, relations });
      } else { 
        return Promise.reject(`Tag ${tag} already exists`);
      }
    }

    const removeTag = (tag: Tag) => {
      tags = tags.filter(t => t !== tag);
      return writeJSONFile(fileHandle, { tags, entities, relations });
    }

    const addEntity = (entity: Entity) => {
      if (!entities.find(e => e.id === entity.id)) {
        entities = [...entities, entity];
        return writeJSONFile(fileHandle, { tags, entities, relations });
      } else {
        return Promise.reject(`Entity with ID ${entity.id} already exists`);
      }
    }

    const removeEntity = (entityOrId: Entity | string) => {
      const id = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
      entities = entities.filter(e => e.id !== id);
      return writeJSONFile(fileHandle, { tags, entities, relations });
    }

    const addRelation = (relation: Relation) => {
      if (!relations.find(r => r.id === relation.id)) {
        relations = [...relations, relation];
        return writeJSONFile(fileHandle, { tags, entities, relations });
      } else {
        return Promise.reject(`Relation with ID ${relation.id} already exists`);
      }
    }

    const removeRelation = (relationOrId: Relation | string) => {
      const id = typeof relationOrId === 'string' ? relationOrId : relationOrId.id;
      entities = entities.filter(e => e.id !== id);
      return writeJSONFile(fileHandle, { tags, entities, relations });
    }

    const getVocabulary = () => ({ entities, relations, tags });

    resolve({
      addTag,
      removeTag,
      addEntity,
      removeEntity,
      addRelation,
      removeRelation,
      getVocabulary
    });

});