#!/usr/bin/env bash
# Публикация WC-Timeline на GitHub Pages одной командой.
# Сборка → коммит изменений WC-Timeline → извлечение поддерева → push в выделенный репо.
# Запуск:  npm run publish            (сообщение по умолчанию)
#          npm run publish "текст"    (своё сообщение коммита)
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)"
cd "$ROOT"
MSG="${1:-content: обновление WC-Timeline}"

echo "→ Сборка…"
( cd WC-Timeline && npm run build >/dev/null )

echo "→ Коммит изменений WC-Timeline…"
git add WC-Timeline
if git diff --cached --quiet -- WC-Timeline; then
  echo "  нет изменений для коммита"
else
  git commit -m "$MSG" -- WC-Timeline >/dev/null
  echo "  закоммичено: $MSG"
fi

echo "→ Извлечение поддерева и публикация…"
git branch -D wc-deploy >/dev/null 2>&1 || true
git subtree split --prefix=WC-Timeline -b wc-deploy >/dev/null
git push -f wc-timeline wc-deploy:main

echo "✓ Опубликовано → https://satoriarie.github.io/wc-timeline/ (обновится через ~1–2 мин)"
