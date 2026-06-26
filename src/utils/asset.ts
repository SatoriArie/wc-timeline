// Возвращает корректный URL изображения с учётом base-пути сборки.
// - http(s):// и data: и абсолютные '/...' возвращаются как есть
// - относительные пути (напр. 'images/portraits/arthas.jpg') получают префикс BASE_URL,
//   чтобы работать и локально, и на GitHub Pages в подкаталоге.
export function assetUrl(path: string | undefined): string {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('/')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || '/';
  return base.replace(/\/$/, '') + '/' + path.replace(/^\.?\//, '');
}
