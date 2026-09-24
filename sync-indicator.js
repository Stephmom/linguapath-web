const syncLabel = document.querySelector('#sync-status');
let saveRevision = 0;
const setSyncLabel = value => { if (syncLabel) syncLabel.textContent = value; };
const saveToCloud = window.lpSaveProgress;
window.lpSaveProgress = state => {
  if (!window.__lpCloudUser) {
    setSyncLabel('Not synced');
    return saveToCloud(state);
  }
  const revision = ++saveRevision;
  setSyncLabel('Syncing…');
  return saveToCloud(state).then(ok => {
    if (revision === saveRevision) setSyncLabel(ok ? 'Saved' : 'Sync failed');
    return ok;
  });
};
const syncPoll = setInterval(() => {
  if (!window.__lpCloudUser) return;
  setSyncLabel('Saved');
  clearInterval(syncPoll);
}, 300);
if (!window.__lpCloudUser) setSyncLabel('Not synced');
