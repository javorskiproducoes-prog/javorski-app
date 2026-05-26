import { useMemo } from 'react'
import { EQUIPE, TEMPO_EM_MIN } from '../lib/constants'

function mediaEditDia(registros, pessoa) {
  const dias = {}
  registros.filter(r => r.pessoa === pessoa).forEach(r => {
    let e = 0
    r.blocos.forEach(b => b.forEach(ev => { e += Number(ev.edicoes) || 0 }))
    if (!dias[r.data]) dias[r.data] = 0
    dias[r.data] += e
  })
  const vals = Object.values(dias).filter(v => v > 0)
  if (!vals.length) return null
  const media = vals.reduce((a, b) => a + b, 0) / vals.length
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const abaixo60 = vals.filter(v => v < media * 0.6).length
  return { media: Math.round(media), max, min, abaixo60, total: vals.reduce((a,b)=>a+b,0), dias: Object.entries(dias) }
}

function TopProjetos({ registros }) {
  const projetos = {}
  registros.forEach(r => r.blocos.forEach(b => b.forEach(ev => {
    if (!ev.projeto) return
    const key = ev.projeto.trim()
    if (!projetos[key]) projetos[key] = { mins: 0, pessoa: r.pessoa }
    projetos[key].mins += TEMPO_EM_MIN[ev.tempo] || 0
  })))
  const top = Object.entries(projetos).sort((a,b) => b[1].mins - a[1].mins).slice(0,10)
  const max = top[0]?.[1].mins || 1

  return (
    <div className="card">
      <div className="card-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>🗂 Top projetos por tempo dedicado</span>
      </div>
      <div className="card-body">
        {top.map(([proj, { mins }]) => {
          const pct = Math.round((mins / max) * 100)
          const h = Math.floor(mins / 60)
          const m = mins % 60
          return (
            <div key={proj} className="barra-wrap">
              <span className="barra-label" style={{ minWidth: 140, fontSize: 11 }}>{proj.length > 22 ? proj.slice(0,20)+'…' : proj}</span>
              <div className="barra-track">
                <div className="barra-fill" style={{ width: `${pct}%`, background: '#1C1B18' }} />
              </div>
              <span className="barra-valor">{h > 0 ? `${h}h` : ''}{m > 0 ? `${m}min` : ''}</span>
            </div>
          )
        })}
        {top.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>Sem dados.</p>}
      </div>
    </div>
  )
}

export function Analise({ registros }) {
  const fotoPessoas = EQUIPE.filter(p => p.tipo === 'foto')
  const anaReg = registros.filter(r => r.pessoa === 'Ana')

  const anaCategs = useMemo(() => {
    const c = {}
    anaReg.forEach(r => r.blocos.forEach(b => b.forEach(ev => {
      if (!ev.categoria) return
      c[ev.categoria] = (c[ev.categoria] || 0) + (TEMPO_EM_MIN[ev.tempo] || 0)
    })))
    return Object.entries(c).sort((a,b)=>b[1]-a[1])
  }, [anaReg])

  return (
    <div>
      <h2 className="section-title">Análise</h2>

      {/* Edições por fotógrafo */}
      <div className="mb-6">
        <p className="section-sub">📷 Edições — médias e discrepâncias</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {fotoPessoas.map(p => {
            const stats = mediaEditDia(registros, p.nome)
            if (!stats) return (
              <div key={p.nome} className="card card-body">
                <div style={{ fontWeight: 600, color: p.cor }}>{p.nome}</div>
                <p className="text-muted text-sm mt-3">Sem registros de edição.</p>
              </div>
            )
            return (
              <div key={p.nome} className="card card-body">
                <div style={{ fontWeight: 600, color: p.cor, marginBottom: 12 }}>{p.nome}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Média/dia', val: stats.media },
                    { label: 'Melhor dia', val: stats.max },
                    { label: 'Pior dia', val: stats.min },
                    { label: 'Total', val: stats.total },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg2)', borderRadius: 8 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: p.cor }}>{val.toLocaleString('pt-BR')}</div>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>{label}</div>
                    </div>
                  ))}
                </div>
                {stats.abaixo60 > 0 && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#DC2626' }}>
                    ⚠️ {stats.abaixo60} dia(s) abaixo de 60% da média
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Top projetos */}
      <div className="mb-6">
        <TopProjetos registros={registros} />
      </div>

      {/* Ana */}
      {anaReg.length > 0 && (
        <div className="mb-6">
          <p className="section-sub">🤝 Ana — tempo por categoria</p>
          <div className="card card-body">
            {anaCategs.map(([cat, mins]) => {
              const max = anaCategs[0]?.[1] || 1
              const pct = Math.round((mins / max) * 100)
              return (
                <div key={cat} className="barra-wrap">
                  <span className="barra-label" style={{ minWidth: 160, fontSize: 12 }}>{cat}</span>
                  <div className="barra-track">
                    <div className="barra-fill" style={{ width: `${pct}%`, background: '#2C2C2A' }} />
                  </div>
                  <span className="barra-valor">{mins}min</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
