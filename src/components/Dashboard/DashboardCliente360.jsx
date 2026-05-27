function agruparCliente(eventos, cliente) {
  const lista = eventos.filter(ev => ev.cliente === cliente)
  const pessoas = [...new Set(lista.map(ev => ev.pessoa).filter(Boolean))]
  const etapas = {}
  let edicoes = 0
  let selecoes = 0
  let foto = 0
  let video = 0
  let adm = 0
  let ultima = ''

  lista.forEach(ev => {
    etapas[ev.categoria] = (etapas[ev.categoria] || 0) + ev.minutos
    edicoes += ev.edicoes
    selecoes += ev.selecoes

    if (ev.tipo === 'foto') foto += ev.minutos
    if (ev.tipo === 'video') video += ev.minutos
    if (ev.tipo === 'adm') adm += ev.minutos

    if (!ultima || String(ev.data) > String(ultima)) ultima = ev.data
  })

  return { pessoas, etapas, edicoes, selecoes, foto, video, adm, ultima }
}

export function DashboardCliente360({ eventos, topClientes, formatHoras }) {
  return (
    <div className="card mb-6">
      <div className="card-header">
        <strong>👥 Cliente 360</strong>
      </div>

      <div className="card-body">
        {topClientes.length === 0 && (
          <p className="text-muted text-sm">Nenhum cliente encontrado com os filtros atuais.</p>
        )}

        {topClientes.map(([cliente, mins]) => {
          const d = agruparCliente(eventos, cliente)
          const topEtapas = Object.entries(d.etapas).sort((a, b) => b[1] - a[1]).slice(0, 5)

          return (
            <div key={cliente} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <strong>{cliente}</strong>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                    Tempo total: {formatHoras(mins)} • Última atividade: {d.ultima || '—'}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Equipe: <strong>{d.pessoas.join(', ') || '—'}</strong>
                </div>
              </div>

              <div className="metric-grid" style={{ marginTop: 14 }}>
                <div className="metric-card"><div className="metric-value">{formatHoras(d.foto)}</div><div className="metric-label">Foto</div></div>
                <div className="metric-card"><div className="metric-value">{formatHoras(d.video)}</div><div className="metric-label">Vídeo</div></div>
                <div className="metric-card"><div className="metric-value">{formatHoras(d.adm)}</div><div className="metric-label">ADM</div></div>
                <div className="metric-card"><div className="metric-value">{d.edicoes.toLocaleString('pt-BR')}</div><div className="metric-label">Edições</div></div>
                <div className="metric-card"><div className="metric-value">{d.selecoes.toLocaleString('pt-BR')}</div><div className="metric-label">Seleções</div></div>
              </div>

              <div style={{ marginTop: 12 }}>
                {topEtapas.map(([etapa, min]) => (
                  <div key={etapa} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    {etapa}: <strong>{formatHoras(min)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}