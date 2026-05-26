import { showToast } from '../components/Toast'

export function Exportar({ registros, exportarCSV }) {
  const totalItens = registros.reduce((a, r) => a + r.blocos.reduce((b, bl) => b + bl.length, 0), 0)
  const ultimos = registros.slice(0, 5)

  function baixarJSON() {
    const data = { versao: '1.0', exportado: new Date().toISOString(), registros }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `javorski_backup_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    showToast('Backup JSON gerado!')
  }

  return (
    <div>
      <h2 className="section-title">Exportar</h2>

      {/* Contadores */}
      <div className="metric-grid mb-6">
        <div className="metric-card">
          <div className="metric-value">{registros.length}</div>
          <div className="metric-label">Registros</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalItens}</div>
          <div className="metric-label">Tarefas</div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => { exportarCSV(); showToast('CSV exportado!') }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          Exportar CSV
        </button>
        <button className="btn btn-ghost" onClick={baixarJSON}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Backup JSON
        </button>
      </div>

      {/* Preview */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontWeight: 600, fontSize: 13 }}>Últimos registros</span>
        </div>
        <div className="card-body">
          {ultimos.length === 0 && <p className="text-muted text-sm">Nenhum registro ainda.</p>}
          {ultimos.map(r => (
            <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{r.pessoa}</span>
              <span className="text-muted"> · {r.data} · {r.turno}</span>
              <span className="text-muted"> · {r.blocos.reduce((a,b)=>a+b.length,0)} tarefa(s)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
