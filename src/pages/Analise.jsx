import { useMemo } from 'react'
import { EQUIPE, TEMPO_EM_MIN } from '../lib/constants'

function normalizarPessoa(nome) {
  if (!nome) return ''
  if (nome.toLowerCase().includes('ana')) return 'Ana'
  return nome
}

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

function formatMin(mins) {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)

  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

function mediaEditDia(registros, pessoa) {
  const dias = {}

  registros
    .filter(r => normalizarPessoa(r.pessoa) === normalizarPessoa(pessoa))
    .forEach(r => {
      let e = 0

      r.blocos.forEach(b =>
        b.forEach(ev => {
          e += Number(ev.edicoes) || 0
        })
      )

      if (!dias[r.data]) dias[r.data] = 0
      dias[r.data] += e
    })

  const vals = Object.values(dias).filter(v => v > 0)

  if (!vals.length) return null

  const media =
    vals.reduce((a, b) => a + b, 0) / vals.length

  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const abaixo60 =
    vals.filter(v => v < media * 0.6).length

  return {
    media: Math.round(media),
    max,
    min,
    abaixo60,
    total: vals.reduce((a, b) => a + b, 0),
    dias: Object.entries(dias),
  }
}

function Barra({ label, valor, max, cor = '#1C1B18' }) {
  const pct =
    max > 0
      ? Math.round((valor / max) * 100)
      : 0

  return (
    <div className="barra-wrap">
      <span
        className="barra-label"
        style={{
          minWidth: 160,
          fontSize: 12,
        }}
      >
        {label}
      </span>

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
        {formatMin(valor)}
      </span>
    </div>
  )
}

function TopProjetos({ registros }) {
  const projetos = {}

  registros.forEach(r =>
    r.blocos.forEach(b =>
      b.forEach(ev => {
        if (!ev.projeto) return

        const key = ev.projeto.trim()
        const mins = minutosDoEvento(ev)

        if (!projetos[key]) {
          projetos[key] = {
            mins: 0,
            pessoas: new Set(),
          }
        }

        projetos[key].mins += mins
        projetos[key].pessoas.add(r.pessoa)
      })
    )
  )

  const top = Object.entries(projetos)
    .sort((a, b) => b[1].mins - a[1].mins)
    .slice(0, 10)

  const max = top[0]?.[1].mins || 1

  return (
    <div className="card">
      <div className="card-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          🗂 Top projetos por tempo dedicado
        </span>
      </div>

      <div className="card-body">
        {top.map(([proj, { mins }]) => (
          <Barra
            key={proj}
            label={proj.length > 26 ? proj.slice(0, 24) + '…' : proj}
            valor={mins}
            max={max}
          />
        ))}

        {top.length === 0 && (
          <p className="text-muted" style={{ fontSize: 13 }}>
            Sem dados.
          </p>
        )}
      </div>
    </div>
  )
}

function TempoPorPessoa({ registros }) {
  const dados = {}

  registros.forEach(r => {
    const pessoa = normalizarPessoa(r.pessoa)

    if (!dados[pessoa]) dados[pessoa] = 0

    r.blocos.forEach(b =>
      b.forEach(ev => {
        dados[pessoa] += minutosDoEvento(ev)
      })
    )
  })

  const lista = Object.entries(dados)
    .sort((a, b) => b[1] - a[1])

  const max = lista[0]?.[1] || 1

  return (
    <div className="card">
      <div className="card-header">
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          ⏱ Tempo por pessoa
        </span>
      </div>

      <div className="card-body">
        {lista.map(([pessoa, mins]) => (
          <Barra
            key={pessoa}
            label={pessoa}
            valor={mins}
            max={max}
          />
        ))}
      </div>
    </div>
  )
}

function TempoPorCategoria({ registros, pessoaFiltro }) {
  const categorias = {}

  registros
    .filter(r =>
      pessoaFiltro
        ? normalizarPessoa(r.pessoa) === normalizarPessoa(pessoaFiltro)
        : true
    )
    .forEach(r =>
      r.blocos.forEach(b =>
        b.forEach(ev => {
          if (!ev.categoria) return

          categorias[ev.categoria] =
            (categorias[ev.categoria] || 0) +
            minutosDoEvento(ev)
        })
      )
    )

  const lista = Object.entries(categorias)
    .sort((a, b) => b[1] - a[1])

  const max = lista[0]?.[1] || 1

  return (
    <div className="card card-body">
      {lista.map(([cat, mins]) => (
        <Barra
          key={cat}
          label={cat}
          valor={mins}
          max={max}
        />
      ))}

      {lista.length === 0 && (
        <p className="text-muted text-sm">
          Sem dados.
        </p>
      )}
    </div>
  )
}

export function Analise({ registros }) {
  const fotoPessoas =
    EQUIPE.filter(p => p.tipo === 'foto')

  const anaReg =
    registros.filter(
      r => normalizarPessoa(r.pessoa) === 'Ana'
    )

  return (
    <div>
      <h2 className="section-title">
        Análise
      </h2>

      <div className="mb-6">
        <p className="section-sub">
          📷 Edições — médias e discrepâncias
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
            gap: 16,
          }}
        >
          {fotoPessoas.map(p => {
            const stats =
              mediaEditDia(
                registros,
                p.nome
              )

            if (!stats) {
              return (
                <div
                  key={p.nome}
                  className="card card-body"
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: p.cor,
                    }}
                  >
                    {p.nome}
                  </div>

                  <p className="text-muted text-sm mt-3">
                    Sem registros de edição.
                  </p>
                </div>
              )
            }

            return (
              <div
                key={p.nome}
                className="card card-body"
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: p.cor,
                    marginBottom: 12,
                  }}
                >
                  {p.nome}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {[
                    {
                      label: 'Média/dia',
                      val: stats.media,
                    },
                    {
                      label: 'Melhor dia',
                      val: stats.max,
                    },
                    {
                      label: 'Pior dia',
                      val: stats.min,
                    },
                    {
                      label: 'Total',
                      val: stats.total,
                    },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      style={{
                        textAlign: 'center',
                        padding: '8px',
                        background: 'var(--bg2)',
                        borderRadius: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: p.cor,
                        }}
                      >
                        {val.toLocaleString('pt-BR')}
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--text-tertiary)',
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {stats.abaixo60 > 0 && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      color: '#DC2626',
                    }}
                  >
                    ⚠️ {stats.abaixo60} dia(s) abaixo de 60% da média
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-6">
        <TempoPorPessoa registros={registros} />
      </div>

      <div className="mb-6">
        <TopProjetos registros={registros} />
      </div>

      {anaReg.length > 0 && (
        <div className="mb-6">
          <p className="section-sub">
            🤝 Ana — tempo por categoria
          </p>

          <TempoPorCategoria
            registros={registros}
            pessoaFiltro="Ana"
          />
        </div>
      )}
    </div>
  )
}