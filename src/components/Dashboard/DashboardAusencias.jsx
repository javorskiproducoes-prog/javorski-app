function Barra({ label, valor, max, cor = '#1C1B18', sufixo = 'h' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0

  return (
    <div className="barra-wrap">
      <span className="barra-label" style={{ minWidth: 180 }}>{label}</span>
      <div className="barra-track">
        <div className="barra-fill" style={{ width: `${pct}%`, background: cor }} />
      </div>
      <span className="barra-valor">{valor}{sufixo}</span>
    </div>
  )
}

export function DashboardAusencias({ topCategorias, topClientes, topServicos, topAusencias, horas }) {
  const maxCat = Math.max(...topCategorias.map(([, v]) => horas(v)), 1)
  const maxCli = Math.max(...topClientes.map(([, v]) => horas(v)), 1)
  const maxServ = Math.max(...topServicos.map(([, v]) => horas(v)), 1)
  const maxAus = Math.max(...topAusencias.map(([, v]) => horas(v)), 1)

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="card-header"><strong>🔥 Gargalos por etapa</strong></div>
        <div className="card-body">
          {topCategorias.map(([cat, mins]) => (
            <Barra key={cat} label={cat} valor={horas(mins)} max={maxCat} cor="#BA7517" />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>👥 Tempo por cliente</strong></div>
        <div className="card-body">
          {topClientes.map(([cli, mins]) => (
            <Barra key={cli} label={cli} valor={horas(mins)} max={maxCli} cor="#534AB7" />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>💼 Tempo por serviço</strong></div>
        <div className="card-body">
          {topServicos.map(([serv, mins]) => (
            <Barra key={serv} label={serv} valor={horas(mins)} max={maxServ} cor="#0F6E56" />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><strong>🚫 Ausências / externos</strong></div>
        <div className="card-body">
          {topAusencias.length === 0 && <p className="text-muted text-sm">Sem ausências no período.</p>}
          {topAusencias.map(([pessoa, mins]) => (
            <Barra key={pessoa} label={pessoa} valor={horas(mins)} max={maxAus} cor="#993556" />
          ))}
        </div>
      </div>
    </div>
  )
}