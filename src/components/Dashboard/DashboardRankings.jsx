function LinhaRanking({ pos, nome, valor, detalhe }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <strong>#{pos}</strong>
      <div>
        <strong>{nome}</strong>
        {detalhe && <div className="text-muted" style={{ fontSize: 12 }}>{detalhe}</div>}
      </div>
      <strong>{valor}</strong>
    </div>
  )
}

export function DashboardRankings({ rankingPessoas, topClientes, topCategorias, formatHoras }) {
  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="card-header"><strong>🏆 Ranking por tempo</strong></div>
        <div className="card-body">
          {rankingPessoas.map((p, index) => (
            <LinhaRanking
              key={p.nome}
              pos={index + 1}
              nome={p.nome}
              valor={formatHoras(p.minutos)}
              detalhe={`${p.tarefas} tarefas`}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>👥 Clientes mais pesados</strong></div>
        <div className="card-body">
          {topClientes.map(([cliente, mins], index) => (
            <LinhaRanking
              key={cliente}
              pos={index + 1}
              nome={cliente}
              valor={formatHoras(mins)}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>🔥 Maiores gargalos</strong></div>
        <div className="card-body">
          {topCategorias.map(([cat, mins], index) => (
            <LinhaRanking
              key={cat}
              pos={index + 1}
              nome={cat}
              valor={formatHoras(mins)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}