// Публичный фасад слоя данных.
export type {
  Character,
  TimelineEvent,
  Zone,
  SourceRef,
  SourceType,
  ZoneChronicle,
  Organization,
  Relation,
  RelationKind,
  PageId,
} from './types';
export { eraOrder, regionOrder, eraTheme, shortEra } from './order';
export { orgCategories, orgCategoryOrder, categoryMeta } from './organizations';
export { fetchContent, fetchRepo, saveDataset, seedCloud } from './source';
export type { Content, DatasetId } from './source';
export { supabase, isCloud } from './supabase';
