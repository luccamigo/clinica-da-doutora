// Converte payloads de erro (FastAPI/Pydantic) em string amigável
export function formatApiError(err) {
  if (!err) return '';
  if (typeof err === 'string') return err;
  // { detail: [ { msg, loc, ... } ] } ou { detail: 'mensagem' }
  if (Array.isArray(err)) {
    return err.map((e) => e?.msg || JSON.stringify(e)).join('\n');
  }
  if (typeof err === 'object') {
    if (typeof err.detail === 'string') return err.detail;
    if (Array.isArray(err.detail)) return err.detail.map((e) => e?.msg || JSON.stringify(e)).join('\n');
    try { return JSON.stringify(err); } catch { return String(err); }
  }
  return String(err);
}
