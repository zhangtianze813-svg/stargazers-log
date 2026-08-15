document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('starred-list');
  if (!container) return;

  fetch('events.json', {cache: 'no-store'})
    .then(resp => {
      if (!resp.ok) throw new Error(`Network error: ${resp.status}`);
      return resp.json();
    })
    .then(events => renderList(events, container))
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p class="empty">Unable to load starred repositories.</p>`;
    });
});

function renderList(events, container){
  if (!Array.isArray(events) || events.length === 0){
    container.innerHTML = '<p class="empty">No starred repositories found.</p>';
    return;
  }

  // If the feed contains objects with repo property (like GitHub star events), map them.
  const items = events.map(e => e.repo ? e.repo : e);

  const list = document.createElement('div');
  list.className = 'repo-list';

  items.forEach(item =>{
    const el = document.createElement('article');
    el.className = 'repo-item';

    const avatar = document.createElement('img');
    avatar.className = 'avatar';
    avatar.src = item.owner && item.owner.avatar_url ? item.owner.avatar_url : '';
    avatar.alt = item.owner && item.owner.login ? item.owner.login : 'owner avatar';

    const meta = document.createElement('div');
    meta.className = 'repo-meta';

    const title = document.createElement('h2');
    title.className = 'repo-name';
    const a = document.createElement('a');
    a.href = item.html_url || '#';
    a.textContent = item.full_name || item.name || 'repository';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    title.appendChild(a);

    const desc = document.createElement('p');
    desc.className = 'repo-desc';
    desc.textContent = item.description || '';

    const metaRow = document.createElement('div');
    metaRow.className = 'meta-row';
    // show starred_at if the events had it
    if (item.starred_at){
      metaRow.textContent = `Starred: ${formatDate(item.starred_at)}`;
    } else if (item.pushed_at){
      metaRow.textContent = `Last push: ${formatDate(item.pushed_at)}`;
    }

    meta.appendChild(title);
    if (desc.textContent) meta.appendChild(desc);
    if (metaRow.textContent) meta.appendChild(metaRow);

    el.appendChild(avatar);
    el.appendChild(meta);

    list.appendChild(el);
  });

  // replace loading state
  container.innerHTML = '';
  container.appendChild(list);
}

function formatDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){
    return iso;
  }
}
