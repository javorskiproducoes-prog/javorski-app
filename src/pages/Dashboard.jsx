import { useMemo } from 'react'
import { EQUIPE, TEMPO_EM_MIN } from '../lib/constants'
import { Avatar } from '../components/Avatar'

function getMetricas(registros) {
  let totalRegistros = registros.length
  let totalEdicoes = 0
  let totalSelecoes = 0
  let totalMinutos = 0
  let diasAtivos = new Set()

  const porPessoa = {}
  EQUIPE.forEach(p => {
    porPessoa[p.nome] = { edicoes: 0, selecoes: 0, minutos: 0, minutosVideo: 0, minutesFoto: 0, dias: new Set(), pessoa: p }
  })

  registros.forEach(r => {
    diasAtivos.add(r.data)
    const pp = porPessoa[r.pessoa]
    if (pp) pp.dias.add(r.data)

    r.blocos.forEach(bloco => {
      bloco.forEach(ev => {
        const mins = TEMPO_EM_MIN[ev.tempo] || 0
        totalMinutos += mins
        if (pp) {
          pp.minutos += mins
          const isVideo = ['Decupagem','Montagem','Partes','Cor','Reels','Revisão — Vídeo','Gravação — Ensaio','Gravação — Evento','Gravação — Empresarial'].includes(ev.categoria)
          if (isVideo) pp.minutosVideo += mins
          else pp.minutesFoto += mins
        }
        const e = Number(ev.edicoes) || 0
        const s = Number(ev.selecoes) || 0
        totalEdicoes += e
        totalSelecoes += s
        if (pp) { pp.edicoes += e; pp.selecoes += s }
      })
    })
  })

  return { totalRegistros, totalEdicoes, totalSelecoes, totalMinutos, diasAtivos: diasAtivos.size, porPessoa }
}

function Barra({ label, valor, max, cor, sufixo = '' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0
  return (
    <div className="barra-wrap">
      <span className="barra-label">{label}</span>
      <div className="barra-track">
        <div className="barra-fill" style={{ width: `${pct}%`, background: cor }} />
      </div>
      <span className="barra-valor">{valor.toLocaleString('pt-BR')}{sufixo}</span>
    </div>
  )
}

export function Dashboard({ registros }) {
  const { totalRegistros, totalEdicoes, totalSelecoes, totalMinutos, diasAtivos, porPessoa } = useMemo(() => getMetricas(registros), [registros])

  const fotoPessoas = EQUIPE.filter(p => p.tipo === 'foto')
  const videoPessoas = EQUIPE.filter(p => p.tipo === 'video')
  const maxEdicoes = Math.max(...fotoPessoas.map(p => porPessoa[p.nome]?.edicoes || 0), 1)
  const maxMinutos = Math.max(...EQUIPE.map(p => porPessoa[p.nome]?.minutos || 0), 1)

  // Tempo por categoria
  const catMinutos = {}
  registros.forEach(r => r.blocos.forEach(b => b.forEach(ev => {
    if (ev.categoria) catMinutos[ev.categoria] = (catMinutos[ev.categoria] || 0) + (TEMPO_EM_MIN[ev.tempo] || 0)
  })))
  const topCats = Object.entries(catMinutos).sort((a,b) => b[1]-a[1]).slice(0, 10)
  const maxCatMin = topCats[0]?.[1] || 1

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

      {/* KPIs */}
      <div className="metric-grid mb-6">
        <div className="metric-card">
          <div className="metric-value">{totalRegistros}</div>
          <div className="metric-label">Registros</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{diasAtivos}</div>
          <div className="metric-label">Dias ativos</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalEdicoes.toLocaleString('pt-BR')}</div>
          <div className="metric-label">Total edições</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalSelecoes.toLocaleString('pt-BR')}</div>
          <div className="metric-label">Total seleções</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{Math.round(totalMinutos / 60)}</div>
          <div className="metric-label">Horas registradas</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="mb-6">
        {/* Edições por fotógrafo */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: 13 }}>📷 Edições por fotógrafo</span>
          </div>
          <div className="card-body">
            {fotoPessoas.map(p => (
              <Barra key={p.nome} label={p.nome} valor={porPessoa[p.nome]?.edicoes || 0} max={maxEdicoes} cor={p.cor} />
            ))}
          </div>
        </div>

        {/* Horas por pessoa */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: 13 }}>⏱ Horas registradas por pessoa</span>
          </div>
          <div className="card-body">
            {EQUIPE.map(p => {
              const mins = porPessoa[p.nome]?.minutos || 0
              return <Barra key={p.nome} label={p.nome} valor={Math.round(mins / 60)} max={Math.round(maxMinutos / 60)} cor={p.cor} sufixo="h" />
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top categorias */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: 13 }}>🏷 Tempo por categoria (top 10)</span>
          </div>
          <div className="card-body">
            {topCats.map(([cat, mins]) => (
              <Barra key={cat} label={cat.length > 22 ? cat.slice(0,20)+'…' : cat} valor={Math.round(mins/60)} max={Math.round(maxCatMin/60)} cor="#1C1B18" sufixo="h" />
            ))}
            {topCats.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>Sem dados ainda.</p>}
          </div>
        </div>

        {/* Produção vs Pós-produção vídeo */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontWeight: 600, fontSize: 13 }}>🎬 Produção vs Pós-produção (vídeo)</span>
          </div>
          <div className="card-body">
            {videoPessoas.map(p => {
              const pp = porPessoa[p.nome]
              const total = (pp?.minutosVideo || 0)
              const hProd = Math.round((pp?.minutosVideo || 0) / 60)
              return (
                <div key={p.nome} className="mb-3">
                  <div className="flex justify-between mb-2">
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{p.nome}</span>
                    <span className="text-xs text-muted">{hProd}h total</span>
                  </div>
                  <Barra label="" valor={hProd} max={Math.max(...videoPessoas.map(vp => Math.round((porPessoa[vp.nome]?.minutosVideo||0)/60)), 1)} cor={p.cor} sufixo="h" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
