import { useState } from 'react'
import { EQUIPE, categoriaShowsE, categoriaShowsS } from '../lib/constants'
import { Avatar } from '../components/Avatar'
import { showToast } from '../components/Toast'

function getPessoa(nome) {
  return EQUIPE.find(p => p.nome === nome) || { nome, cor: '#999', iniciais: nome.slice(0,2).toUpperCase() }
}

function CatPill({ cat, cor }) {
  return (
    <span className="cat-pill" style={{ background: `${cor}18`, color: cor, border: `1px solid ${cor}30` }}>
      {cat}
    </span>
  )
}

export function Historico({ registros, deletarRegistro }) {
  const [busca, setBusca] = useState('')
  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  const filtered = registros
    .filter(r => (!filtroPessoa || r.pessoa === filtroPessoa))
    .filter(r => {
      if (!busca) return true
      const q = busca.toLowerCase()
      return r.pessoa.toLowerCase().includes(q) || r.data.includes(q) ||
        r.blocos.some(b => b.some(ev => (ev.projeto || '').toLowerCase().includes(q) || (ev.categoria || '').toLowerCase().includes(q)))
    })

  async function handleDelete(id) {
    const ok = await deletarRegistro(id)
    if (ok) { showToast('Registro removido.'); setConfirmDel(null) }
    else showToast('Erro ao remover.')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Histórico</h2>
        <span className="text-muted text-sm">{filtered.length} registro(s)</span>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <input
          className="form-input"
          style={{ maxWidth: 280 }}
          placeholder="Buscar por nome, projeto, categoria…"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <select className="form-select" style={{ maxWidth: 180 }} value={filtroPessoa} onChange={e => setFiltroPessoa(e.target.value)}>
          <option value="">Todos</option>
          {EQUIPE.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
        </select>
      </div>

      <div className="flex-col gap-3">
        {filtered.map(r => {
          const pessoa = getPessoa(r.pessoa)
          const totalItens = r.blocos.reduce((a, b) => a + b.length, 0)
          const totalEd = r.blocos.reduce((a, b) => b.reduce((c, ev) => c + (Number(ev.edicoes)||0), a), 0)
          const totalSe = r.blocos.reduce((a, b) => b.reduce((c, ev) => c + (Number(ev.selecoes)||0), a), 0)

          return (
            <div key={r.id} className="historico-item">
              <div className="historico-header">
                <div className="flex items-center gap-2">
                  <Avatar pessoa={pessoa} size={28} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.pessoa}</span>
                  <span className="text-muted text-xs">·</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="cat-pill" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 10 }}>
                    {r.turno}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{totalItens} tarefa(s)</span>
                  {totalEd > 0 && <span className="text-xs" style={{ color: pessoa.cor, fontWeight: 600 }}>E: {totalEd.toLocaleString('pt-BR')}</span>}
                  {totalSe > 0 && <span className="text-xs" style={{ color: pessoa.cor, fontWeight: 600 }}>S: {totalSe.toLocaleString('pt-BR')}</span>}
                  {confirmDel === r.id ? (
                    <div className="flex gap-2">
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Confirmar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-icon" onClick={() => setConfirmDel(r.id)} title="Remover">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Blocos */}
              {r.blocos.map((bloco, bi) => bloco.length > 0 && (
                <div key={bi} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ padding: '6px 16px', background: 'var(--bg)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                    Bloco {bi + 1}
                  </div>
                  {bloco.map((ev, ii) => (
                    <div key={ii} style={{ padding: '8px 16px', borderLeft: `3px solid ${pessoa.cor}`, borderBottom: ii < bloco.length - 1 ? '1px solid var(--border-light)' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      {ev.categoria && <CatPill cat={ev.categoria} cor={pessoa.cor} />}
                      {ev.projeto && <span style={{ fontSize: 12, fontWeight: 500 }}>{ev.projeto}</span>}
                      {ev.status && ev.status !== '—' && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{ev.status}</span>}
                      {ev.tempo && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>⏱ {ev.tempo}</span>}
                      {(Number(ev.edicoes)||0) > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: pessoa.cor }}>E:{ev.edicoes}</span>}
                      {(Number(ev.selecoes)||0) > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: pessoa.cor }}>S:{ev.selecoes}</span>}
                      {ev.observacao && <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>{ev.observacao}</span>}
                    </div>
                  ))}
                </div>
              ))}
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
