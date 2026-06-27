import { useCallback, useEffect, useRef, useState } from 'react';
import type { Character, Organization, TimelineEvent, Zone } from '../data/types';
import { fetchContent, isCloud, supabase, type Content } from '../data';

const LS_KEY = 'wc-timeline-draft-v2';

interface Draft {
  events?: TimelineEvent[];
  characters?: Character[];
  zones?: Zone[];
  organizations?: Organization[];
}

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

export type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * Загружает контент рантаймом (из public/data; позже — из Supabase).
 * Правки хранятся черновиком в localStorage; источник правды — внешние данные.
 */
export function useContent() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState('');
  const [events, setEventsRaw] = useState<TimelineEvent[]>([]);
  const [characters, setCharactersRaw] = useState<Character[]>([]);
  const [zones, setZonesRaw] = useState<Zone[]>([]);
  const [organizations, setOrganizationsRaw] = useState<Organization[]>([]);

  const repo = useRef<Content | null>(null);
  const loaded = useRef(false);
  const dirty = useRef(false);
  const [syncCount, setSyncCount] = useState(0); // растёт при realtime-обновлении от других

  useEffect(() => {
    let alive = true;
    fetchContent()
      .then((content) => {
        if (!alive) return;
        repo.current = content;
        // в облачном режиме общая БД — источник правды; локальный черновик не накладываем
        const draft = isCloud ? {} : loadDraft();
        setEventsRaw(draft.events ?? content.events);
        setCharactersRaw(draft.characters ?? content.characters);
        setZonesRaw(draft.zones ?? content.zones);
        setOrganizationsRaw(draft.organizations ?? content.organizations);
        loaded.current = true;
        setStatus('ready');
      })
      .catch((e) => {
        if (!alive) return;
        setError(String(e?.message || e));
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  // realtime: подхватываем правки других редакторов без перезагрузки
  useEffect(() => {
    if (!isCloud || !supabase) return;
    const client = supabase;
    const channel = client
      .channel('content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        fetchContent()
          .then((content) => {
            repo.current = content;
            setEventsRaw(content.events);
            setCharactersRaw(content.characters);
            setZonesRaw(content.zones);
            setOrganizationsRaw(content.organizations);
            setSyncCount((n) => n + 1);
          })
          .catch(() => {});
      })
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // сохраняем черновик только после правок пользователя (в статическом режиме)
  useEffect(() => {
    if (isCloud || !loaded.current || !dirty.current) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ events, characters, zones, organizations }));
    } catch {
      /* квота/приватный режим — игнорируем */
    }
  }, [events, characters, zones, organizations]);

  const setEvents = useCallback((u: React.SetStateAction<TimelineEvent[]>) => {
    dirty.current = true;
    setEventsRaw(u);
  }, []);
  const setCharacters = useCallback((u: React.SetStateAction<Character[]>) => {
    dirty.current = true;
    setCharactersRaw(u);
  }, []);
  const setZones = useCallback((u: React.SetStateAction<Zone[]>) => {
    dirty.current = true;
    setZonesRaw(u);
  }, []);
  const setOrganizations = useCallback((u: React.SetStateAction<Organization[]>) => {
    dirty.current = true;
    setOrganizationsRaw(u);
  }, []);

  const resetToRepo = useCallback(() => {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    dirty.current = false;
    if (repo.current) {
      setEventsRaw(repo.current.events);
      setCharactersRaw(repo.current.characters);
      setZonesRaw(repo.current.zones);
      setOrganizationsRaw(repo.current.organizations);
    }
  }, []);

  const hasDraft = (() => {
    if (isCloud) return false;
    try {
      return !!localStorage.getItem(LS_KEY);
    } catch {
      return false;
    }
  })();

  return {
    status,
    error,
    events,
    characters,
    zones,
    organizations,
    setEvents,
    setCharacters,
    setZones,
    setOrganizations,
    resetToRepo,
    hasDraft,
    syncCount,
  };
}

/** Скачивает данные как JSON-файл для коммита в public/data. */
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
