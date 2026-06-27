// Публичный фасад слоя данных.
export type {
  Character,
  TimelineEvent,
  Zone,
  SourceRef,
  SourceType,
  ZoneEra,
  Relation,
  RelationKind,
  PageId,
} from './types';
export { eraOrder, regionOrder } from './order';
export { fetchContent, fetchRepo, saveDataset, seedCloud } from './source';
export type { Content, DatasetId } from './source';
export { supabase, isCloud } from './supabase';
