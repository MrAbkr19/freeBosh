export function typeLabelFor(fileUrl: string): string {
  const ext = fileUrl.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'PDF';
    case 'ppt':
    case 'pptx':
      return 'Diapositives';
    case 'epub':
      return 'eBook';
    case 'zip':
      return 'Archive';
    default:
      return 'Document';
  }
}

export function typeIconFor(fileUrl: string): string {
  const ext = fileUrl.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'picture_as_pdf';
    case 'ppt':
    case 'pptx':
      return 'slideshow';
    case 'epub':
      return 'menu_book';
    case 'zip':
      return 'folder_zip';
    default:
      return 'description';
  }
}

export function initialsFor(fullName?: string): string {
  if (!fullName) return '??';
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor(
    (new Date(now.toDateString()).getTime() - new Date(date.toDateString()).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Ajouté aujourd'hui";
  if (diffDays === 1) return 'Hier';

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} Ko`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}