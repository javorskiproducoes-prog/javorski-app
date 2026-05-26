import { useState } from 'react'
import { EQUIPE } from '../lib/constants'
import { Avatar } from '../components/Avatar'
import { showToast } from '../components/Toast'

function getPessoa(nome) {
  return EQUIPE.find(p => p.nome === nome) || {
    nome,
    cor: '#999',
    iniciais: String(nome || '??').slice(0, 2).toUpperCase()
  }
}

function valor(ev, novo, antigo) {
  return ev?.[novo] ?? ev?.[antigo] ?? ''
}

function numero(ev, novo, antigo) {
  return Number(ev?.[novo] ?? ev?.[antigo] ?? 0) || 0
}

function eventoTemConteudo(ev) {
  return Boolean(
    valor(ev, 'servico', 'servico') ||
    valor(ev, 'categoria', 'cat') ||
    valor(ev, 'projeto', 'ev') ||
    valor(ev, 'tempo', 'tm') ||
    valor(ev, 'status', 'st') ||
    valor(ev, 'observacao', 'ob') ||
    numero(ev, 'edicoes', 'ed') ||
    numero(ev, 'selecoes', 'se')
  )
}

function CatPill({ cat, cor }) {
  return (
    <span
      className="cat-pill"
      style={{
        background: `${cor}18`,
        color: cor,
        border: `1px solid ${cor}30`
      }}
    >
      {cat}
    </span>
  )
}

export function Historico({ registros, deletarRegistro }) {
  const [busca, setBusca] = useState('')
  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const filtered = registros
    .filter(r => !filtroPessoa || r.pessoa === filtroPessoa)
    .filter(r => {
      if (!busca) return true

      const q = busca.toLowerCase()

      return (
        String(r.pessoa || '').toLowerCase().includes(q) ||
        String(r.data || '').includes(q) ||
        r.blocos.some(bloco =>
          bloco.some(ev =>
            String(valor(ev, 'servico', 'servico')).toLowerCase().includes(q) ||
            String(valor(ev, 'projeto', 'ev')).toLowerCase().includes(q) ||
            String(valor(ev, 'categoria', 'cat')).toLowerCase().includes(q) ||
            String(valor(ev, 'tempo', 'tm')).toLowerCase().includes(q) ||
            String(valor(ev, 'status', 'st')).toLowerCase().includes(q)
          )
        )
      )
    })

  async function handleDelete(id) {
    if (!deletarRegistro) {
      showToast('Você não tem permissão para remover registros.')
      return
    }

    const ok = await deletarRegistro(id)

    if (ok) {
      showToast('Registro removido.')
      setConfirmDel(null)
    } else {
      showToast('Erro ao remover.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          Histórico
        </h2>

        <span className="text-muted text-sm">
          {filtered.length} registro(s)
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          className="form-input"
          style={{ maxWidth: 280 }}
          placeholder="Buscar por nome, serviço, projeto, categoria…"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />

        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={filtroPessoa}
          onChange={e => setFiltroPessoa(e.target.value)}
        >
          <option value="">Todos</option>

          {EQUIPE.map(p => (
            <option key={p.nome} value={p.nome}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-col gap-3">
        {filtered.map(r => {
          const pessoa = getPessoa(r.pessoa)

          const blocosComItens = r.blocos.map(bloco =>
            bloco.filter(eventoTemConteudo)
          )

          const totalItens = blocosComItens.reduce(
            (total, bloco) => total + bloco.length,
            0
          )

          const totalEd = blocosComItens.reduce(
            (total, bloco) =>
              total + bloco.reduce(
                (subtotal, ev) => subtotal + numero(ev, 'edicoes', 'ed'),
                0
              ),
            0
          )

          const totalSe = blocosComItens.reduce(
            (total, bloco) =>
              total + bloco.reduce(
                (subtotal, ev) => subtotal + numero(ev, 'selecoes', 'se'),
                0
              ),
            0
          )

          return (
            <div key={r.id} className="historico-item">
              <div className="historico-header">
                <div className="flex items-center gap-2">
                  <Avatar pessoa={pessoa} size={28} />

                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {r.pessoa}
                  </span>

                  <span className="text-muted text-xs">·</span>

                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(r.data + 'T12:00:00').toLocaleDateString(
                      'pt-BR',
                      {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
                  </span>

                  <span
                    className="cat-pill"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      fontSize: 10,
                    }}
                  >
                    {r.turno}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">
                    {totalItens} tarefa(s)
                  </span>

                  {totalEd > 0 && (
                    <span
                      className="text-xs"
                      style={{ color: pessoa.cor, fontWeight: 600 }}
                    >
                      E: {totalEd.toLocaleString('pt-BR')}
                    </span>
                  )}

                  {totalSe > 0 && (
                    <span
                      className="text-xs"
                      style={{ color: pessoa.cor, fontWeight: 600 }}
                    >
                      S: {totalSe.toLocaleString('pt-BR')}
                    </span>
                  )}

                  {deletarRegistro && (
                    <>
                      {confirmDel === r.id ? (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(r.id)}
                          >
                            Confirmar
                          </button>

                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setConfirmDel(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => setConfirmDel(r.id)}
                          title="Remover"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {blocosComItens.map((bloco, bi) =>
                bloco.length > 0 ? (
                  <div
                    key={bi}
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    <div
                      style={{
                        padding: '6px 16px',
                        background: 'var(--bg)',
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      Bloco {bi + 1}
                    </div>

                    {bloco.map((ev, ii) => {
                      const servico = valor(ev, 'servico', 'servico')
                      const categoria = valor(ev, 'categoria', 'cat')
                      const projeto = valor(ev, 'projeto', 'ev')
                      const status = valor(ev, 'status', 'st')
                      const tempo = valor(ev, 'tempo', 'tm')
                      const observacao = valor(ev, 'observacao', 'ob')
                      const edicoes = numero(ev, 'edicoes', 'ed')
                      const selecoes = numero(ev, 'selecoes', 'se')

                      return (
                        <div
                          key={ev.id || ii}
                          style={{
                            padding: '8px 16px',
                            borderLeft: `3px solid ${pessoa.cor}`,
                            borderBottom:
                              ii < bloco.length - 1
                                ? '1px solid var(--border-light)'
                                : 'none',
                            display: 'flex',
                            gap: 10,
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                          }}
                        >
                          {servico && (
                            <span
                              className="cat-pill"
                              style={{
                                background: 'var(--bg)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {servico}
                            </span>
                          )}

                          {categoria && (
                            <CatPill cat={categoria} cor={pessoa.cor} />
                          )}

                          {projeto && (
                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                              {projeto}
                            </span>
                          )}

                          {status && status !== '—' && (
                            <span
                              style={{
                                fontSize: 11,
                                color: 'var(--text-tertiary)',
                              }}
                            >
                              {status}
                            </span>
                          )}

                          {tempo && (
                            <span
                              style={{
                                fontSize: 11,
                                color: 'var(--text-tertiary)',
                              }}
                            >
                              ⏱ {tempo}
                            </span>
                          )}

                          {edicoes > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: pessoa.cor,
                              }}
                            >
                              E:{edicoes}
                            </span>
                          )}

                          {selecoes > 0 && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: pessoa.cor,
                              }}
                            >
                              S:{selecoes}
                            </span>
                          )}

                          {observacao && (
                            <span
                              style={{
                                fontSize: 11,
                                color: 'var(--text-tertiary)',
                                fontStyle: 'italic',
                              }}
                            >
                              {observacao}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : null
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="loading">
            <span>Nenhum registro encontrado.</span>
          </div>
        )}
      </div>
    </div>
  )
}