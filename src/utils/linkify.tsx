import { Fragment, type ReactNode } from 'react';
import type { Character } from '../data/types';

/**
 * Разбивает текст на абзацы и подсвечивает в нём имена известных персонажей,
 * делая их кликабельными ссылками на модалку персонажа.
 */
export function renderDescription(
  text: string,
  characters: Character[],
  onCharacter: (id: string) => void,
): ReactNode {
  const paragraphs = text.split(/\n+/).filter((p) => p.trim());

  // Сопоставление по имени и по первому слову имени (фамилии/титулу) — длинные первыми.
  const names = characters
    .map((c) => ({ id: c.id, name: c.name }))
    .sort((a, b) => b.name.length - a.name.length);

  const pattern = names.length
    ? new RegExp(`(${names.map((n) => escapeRegExp(n.name)).join('|')})`, 'g')
    : null;

  return paragraphs.map((para, pi) => (
    <p key={pi}>{pattern ? linkPara(para, pattern, names, onCharacter) : para}</p>
  ));
}

function linkPara(
  para: string,
  pattern: RegExp,
  names: { id: string; name: string }[],
  onCharacter: (id: string) => void,
): ReactNode {
  const parts = para.split(pattern);
  return parts.map((part, i) => {
    const match = names.find((n) => n.name === part);
    if (match) {
      return (
        <a
          key={i}
          href="#"
          className="character-link"
          onClick={(e) => {
            e.preventDefault();
            onCharacter(match.id);
          }}
        >
          {part}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
