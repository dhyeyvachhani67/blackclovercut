export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeWithMs(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1000) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function getScoreBadge(score) {
  if (score >= 90) {
    return {
      text: `${score}/100 • Extreme Viral Potential`,
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      flame: 'text-emerald-400'
    };
  }
  if (score >= 80) {
    return {
      text: `${score}/100 • High Retention`,
      color: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      flame: 'text-violet-400'
    };
  }
  return {
    text: `${score}/100 • Good Hook`,
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    flame: 'text-amber-400'
  };
}
