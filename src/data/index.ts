// Публичный фасад слоя данных.
export type {
  Character,
  TimelineEvent,
  Zone,
  SourceRef,
  SourceType,
  ZoneChronicle,
  Organization,
  OrgMember,
  Relation,
  RelationKind,
  PageId,
  MapPin,
  MapPinCategory,
} from './types';
export { eraOrder, regionOrder, eraTheme, shortEra } from './order';
export { orgCategories, orgCategoryOrder, categoryMeta } from './organizations';
export { genderOptions, classOptions, raceOptions, findClass, classIcon } from './charMeta';
export type { ClassDef } from './charMeta';
export { PIN_CATEGORIES, pinCategoryMeta } from './mapPins';
export type { PinCategoryMeta } from './mapPins';
export { fetchContent, fetchRepo, saveDataset, seedCloud } from './source';
export type { Content, DatasetId } from './source';
export { supabase, isCloud } from './supabase';
