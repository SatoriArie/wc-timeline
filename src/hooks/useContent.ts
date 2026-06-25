import { useCallback, useEffect, useState } from 'react';
import type { Character, TimelineEvent, Zone } from '../data/types';
import { characters as baseCharacters, events as baseEvents, zones as baseZones } from '../data';

const LS_KEY = 'wc-timeline-draft-v2';

interface Draft {
  events?: TimelineEvent[];
  characters?: Character[];
  zones?: Zone[];
}

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

/**
 * Управляет контентом сайта. Источник истины — JSON-файлы в репозитории,
 * но в режиме редактирования правки хранятся черновиком в localStorage,
 * чтобы не теряться. Экспорт отдаёт готовый JSON для коммита в репозиторий.
 */
export function useContent() {
  const draft = loadDraft();
  const [events, setEvents] = useState<TimelineEvent[]>(draft.events ?? baseEvents);
  const [characters, setCharacters] = useState<Character[]>(draft.characters ?? baseCharacters);
  const [zones, setZones] = useState<Zone[]>(draft.zones ?? baseZones);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ events, characters, zones }));
  }, [events, characters, zones]);

  const resetToRepo = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setEvents(baseEvents);
    setCharacters(baseCharacters);
    setZones(baseZones);
  }, []);

  const hasDraft = !!localStorage.getItem(LS_KEY);

  return {
    events,
    characters,
    zones,
    setEvents,
    setCharacters,
    setZones,
    resetToRepo,
    hasDraft,
  };
}

/** Скачивает данные как JSON-файл для коммита в src/data. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Читает выбранный JSON-файл. */
export function readJsonFile<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as T);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
