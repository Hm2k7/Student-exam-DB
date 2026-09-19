const MANIFEST_PATH = 'data/exams.json';

async function loadManifest() {
  try {
    const res = await fetch(MANIFEST_PATH, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load manifest');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'exam'
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sortExams(list, mode) {
  const arr = [...list];
  switch (mode) {
    case 'name-asc':
      arr.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      arr.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'date-asc':
      arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'date-desc':
    default:
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }
  return arr;
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  if (btn) {
    const original = btn.innerHTML;
    btn.classList.add('copied');
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = original;
    }, 1500);
  }
}

function examViewUrl(id) {
  return `view.html?id=${encodeURIComponent(id)}`;
}

function absoluteUrl(path) {
  return new URL(path, window.location.href).toString();
}
