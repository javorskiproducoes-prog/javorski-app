import { useMemo, useState } from 'react'
import { EQUIPE, TEMPO_EM_MIN } from '../lib/constants'

const SERVICOS = [
  'Todos',
  'Casamento',
  'Pré Wedding',
  'Ensaio',
  'Gestante',
  'Aniversario',
  'Datas especiais',
  'Empresarial',
  'Evento',
  'Outro',
]

function minutosDoEvento(ev) {
  if (Number(ev.tempo_manual_minutos) > 0)
    return Number(ev.tempo_manual_minutos)

  if (Number(ev.horas_calculadas) > 0)
    return Number(ev.horas_calculadas) * 60

  if (TEMPO_EM_MIN[ev.tempo])
    return TEMPO_EM_MIN[ev.tempo]

  return 0
}

function horas(mins) {
  return Math.round((mins / 60) * 10) / 10
}

function Barra({
  label,
  valor,
  max,
  cor = '#1C1B18',
  sufixo = '',
}) {
  const pct =
    max > 0
      ? Math.round((valor / max) * 100)
      : 0

  return (
    <div className="barra-wrap">
      <span className="barra-label">
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
        {valor}
        {sufixo}
      </span>
    </div>
  )
}

export function Dashboard({
  registros,
}) {

  const [
    filtroPessoa,
    setFiltroPessoa,
  ] = useState('Todos')

  const [
    filtroServico,
    setFiltroServico,
  ] = useState('Todos')

  const [
    buscaProjeto,
    setBuscaProjeto,
  ] = useState('')

  const registrosFiltrados =
    useMemo(() => {

      return registros.filter(r => {

        if (
          filtroPessoa !==
            'Todos' &&
          r.pessoa !==
            filtroPessoa
        )
          return false

        let passouServico =
          filtroServico ===
          'Todos'

        let passouProjeto =
          buscaProjeto === ''

        r.blocos.forEach(
          bloco => {

            bloco.forEach(ev => {

              if (
                filtroServico !==
                'Todos'
              ) {

                if (
                  ev.servico ===
                  filtroServico
                ) {
                  passouServico =
                    true
                }
              }

              if (
                buscaProjeto
              ) {

                if (
                  (
                    ev.projeto ||
                    ''
                  )
                    .toLowerCase()
                    .includes(
                      buscaProjeto.toLowerCase()
                    )
                ) {
                  passouProjeto =
                    true
                }
              }

            })

          })

        return (
          passouServico &&
          passouProjeto
        )

      })

    }, [
      registros,
      filtroPessoa,
      filtroServico,
      buscaProjeto,
    ])

  const metricas =
    useMemo(() => {

      let totalEdicoes = 0
      let totalSelecoes = 0
      let totalMinutos = 0

      const porPessoa = {}
      const porCategoria = {}
      const porProjeto = {}

      EQUIPE.forEach(
        p => {

          porPessoa[
            p.nome
          ] = {
            minutos: 0,
            edicoes: 0,
            selecoes: 0,
          }

        })

      registrosFiltrados.forEach(
        r => {

          r.blocos.forEach(
            bloco => {

              bloco.forEach(
                ev => {

                  const mins =
                    minutosDoEvento(
                      ev
                    )

                  totalMinutos +=
                    mins

                  totalEdicoes +=
                    Number(
                      ev.edicoes
                    ) || 0

                  totalSelecoes +=
                    Number(
                      ev.selecoes
                    ) || 0

                  const cat =
                    ev.categoria ||
                    'Sem categoria'

                  const proj =
                    ev.projeto ||
                    'Sem projeto'

                  porCategoria[
                    cat
                  ] =
                    (
                      porCategoria[
                        cat
                      ] ||
                      0
                    ) + mins

                  porProjeto[
                    proj
                  ] =
                    (
                      porProjeto[
                        proj
                      ] ||
                      0
                    ) + mins

                  if (
                    porPessoa[
                      r.pessoa
                    ]
                  ) {

                    porPessoa[
                      r.pessoa
                    ].minutos +=
                      mins

                    porPessoa[
                      r.pessoa
                    ].edicoes +=
                      Number(
                        ev.edicoes
                      ) || 0

                    porPessoa[
                      r.pessoa
                    ].selecoes +=
                      Number(
                        ev.selecoes
                      ) || 0

                  }

                })

            })

        })

      return {
        totalEdicoes,
        totalSelecoes,
        totalMinutos,
        porPessoa,
        porCategoria,
        porProjeto,
      }

    }, [
      registrosFiltrados,
    ])

  const maxPessoa =
    Math.max(
      ...Object.values(
        metricas
          .porPessoa
      ).map(
        p =>
          horas(
            p.minutos
          )
      ),
      1
    )

  return (
    <div>

      <h2 className="section-title">
        Dashboard
      </h2>

      <div
        className="grid grid-3 mb-6"
      >

        <select
          value={
            filtroPessoa
          }
          onChange={e =>
            setFiltroPessoa(
              e.target.value
            )
          }
        >
          <option>
            Todos
          </option>

          {EQUIPE.map(
            p => (
              <option
                key={
                  p.nome
                }
              >
                {p.nome}
              </option>
            )
          )}
        </select>

        <select
          value={
            filtroServico
          }
          onChange={e =>
            setFiltroServico(
              e.target.value
            )
          }
        >
          {SERVICOS.map(
            s => (
              <option
                key={s}
              >
                {s}
              </option>
            )
          )}
        </select>

        <input
          placeholder="Projeto / cliente"
          value={
            buscaProjeto
          }
          onChange={e =>
            setBuscaProjeto(
              e.target.value
            )
          }
        />

      </div>

      <div className="metric-grid">

        <div className="metric-card">
          <div className="metric-value">
            {
              registrosFiltrados.length
            }
          </div>

          <div className="metric-label">
            Registros
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {
              metricas.totalEdicoes
            }
          </div>

          <div className="metric-label">
            Edições
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {
              metricas.totalSelecoes
            }
          </div>

          <div className="metric-label">
            Seleções
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-value">
            {horas(
              metricas.totalMinutos
            )}
          </div>

          <div className="metric-label">
            Horas
          </div>
        </div>

      </div>

      <br />

      {EQUIPE.map(
        p => (

          <Barra
            key={
              p.nome
            }

            label={
              p.nome
            }

            valor={horas(
              metricas
                .porPessoa[
                p.nome
              ]
                ?.minutos ||
              0
            )}

            max={
              maxPessoa
            }

            cor={p.cor}

            sufixo="h"
          />

        )
      )}

    </div>
  )
}