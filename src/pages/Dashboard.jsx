import { useMemo } from 'react'
import { EQUIPE, TEMPO_EM_MIN } from '../lib/constants'

function minutosDoEvento(ev) {
  if (Number(ev.tempo_manual_minutos) > 0) {
    return Number(ev.tempo_manual_minutos)
  }

  if (Number(ev.horas_calculadas) > 0) {
    return Number(ev.horas_calculadas) * 60
  }

  if (TEMPO_EM_MIN[ev.tempo]) {
    return TEMPO_EM_MIN[ev.tempo]
  }

  if (typeof ev.tempo === 'string') {
    const texto = ev.tempo.toLowerCase().trim()

    if (texto.includes('min')) {
      const n = Number(texto.replace(/[^0-9]/g, ''))
      if (n > 0) return n
    }

    if (texto.includes('h')) {
      const n = Number(texto.replace(/[^0-9]/g, ''))
      if (n > 0) return n * 60
    }
  }

  return 0
}

function getMetricas(registros) {
  let totalRegistros = registros.length
  let totalEdicoes = 0
  let totalSelecoes = 0
  let totalMinutos = 0
  let diasAtivos = new Set()

  const porPessoa = {}
  const porCategoria = {}
  const porProjeto = {}

  EQUIPE.forEach(p => {
    porPessoa[p.nome] = {
      edicoes: 0,
      selecoes: 0,
      minutos: 0,
      minutosVideo: 0,
      minutosFoto: 0,
      minutosAdm: 0,
      dias: new Set(),
      pessoa: p,
    }
  })

  registros.forEach(r => {
    diasAtivos.add(r.data)

    const pp = porPessoa[r.pessoa]

    if (pp) {
      pp.dias.add(r.data)
    }

    r.blocos.forEach(bloco => {
      bloco.forEach(ev => {
        const mins = minutosDoEvento(ev)

        totalMinutos += mins

        const categoria = ev.categoria || 'Sem categoria'
        const projeto = ev.projeto || 'Sem projeto'

        porCategoria[categoria] = (porCategoria[categoria] || 0) + mins
        porProjeto[projeto] = (porProjeto[projeto] || 0) + mins

        if (pp) {
          pp.minutos += mins

          if (r.tipo === 'video') {
            pp.minutosVideo += mins
          } else if (r.tipo === 'foto') {
            pp.minutosFoto += mins
          } else {
            pp.minutosAdm += mins
          }
        }

        const ed = Number(ev.edicoes) || 0
        const se = Number(ev.selecoes) || 0

        totalEdicoes += ed
        totalSelecoes += se

        if (pp) {
          pp.edicoes += ed
          pp.selecoes += se
        }
      })
    })
  })

  return {
    totalRegistros,
    totalEdicoes,
    totalSelecoes,
    totalMinutos,
    diasAtivos: diasAtivos.size,
    porPessoa,
    porCategoria,
    porProjeto,
  }
}

function Barra({ label, valor, max, cor = '#1C1B18', sufixo = '' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0

  return (
    <div className="barra-wrap">
      <span className="barra-label">{label}</span>
      <div className="barra-track">
        <div
          className="barra-fill"
          style={{
            width: `${pct}%`,
            background: cor,
          }}
        />
      </div>
      <span className="barra-valor">
        {valor}
        {sufixo}
      </span>
    </div>
  )
}

function horas(minutos) {
  return Math.round((minutos / 60) * 10) / 10
}

export function Dashboard({ registros }) {
  const metricas = useMemo(() => getMetricas(registros), [registros])

  const {
    totalRegistros,
    totalEdicoes,
    totalSelecoes,
    totalMinutos,
    diasAtivos,
    porPessoa,
    porCategoria,
    porProjeto,
  } = metricas

  const maxHorasPessoa = Math.max(
    ...EQUIPE.map(p => horas(porPessoa[p.nome]?.minutos || 0)),
    1
  )

  const topCategorias = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const topProjetos = Object.entries(porProjeto)
    .filter(([nome]) => nome !== 'Sem projeto')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const maxCat = Math.max(...topCategorias.map(([, mins]) => horas(mins)), 1)
  const maxProj = Math.max(...topProjetos.map(([, mins]) => horas(mins)), 1)

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

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
          <div className="metric-label">Edições</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{totalSelecoes.toLocaleString('pt-BR')}</div>
          <div className="metric-label">Seleções</div>
        </div>

        <div className="metric-card">
          <div className="metric-value">{horas(totalMinutos)}</div>
          <div className="metric-label">Horas</div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <strong>⏱ Horas por pessoa</strong>
        </div>

        <div className="card-body">
          {EQUIPE.map(p => (
            <Barra
              key={p.nome}
              label={p.nome}
              valor={horas(porPessoa[p.nome]?.minutos || 0)}
              max={maxHorasPessoa}
              cor={p.cor}
              sufixo="h"
            />
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <strong>🏷 Tempo por categoria</strong>
        </div>

        <div className="card-body">
          {topCategorias.map(([cat, mins]) => (
            <Barra
              key={cat}
              label={cat}
              valor={horas(mins)}
              max={maxCat}
              sufixo="h"
            />
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <strong>📁 Top projetos por tempo dedicado</strong>
        </div>

        <div className="card-body">
          {topProjetos.map(([proj, mins]) => (
            <Barra
              key={proj}
              label={proj.length > 28 ? proj.slice(0, 28) + '…' : proj}
              valor={horas(mins)}
              max={maxProj}
              sufixo="h"
            />
          ))}
        </div>
      </div>
    </div>
  )
}