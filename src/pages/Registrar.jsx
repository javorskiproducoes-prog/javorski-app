import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { EQUIPE, CATEGORIAS, TEMPOS, STATUS_OPTIONS, TURNOS, TIPOS_SERVICO, categoriaShowsE, categoriaShowsS } from '../lib/constants'
import { Avatar } from '../components/Avatar'
import { showToast } from '../components/Toast'

function itemVazio() {
  return { servico: '', cat: '', ev: '', tm: '', st: '', ob: '', ed: '', se: '' }
}

function blocoVazio() {
  return [itemVazio()]
}

function formVazio(date) {
  return {
    date,
    turno: 'Dia completo',
    blocos: [blocoVazio(), blocoVazio(), blocoVazio(), blocoVazio()],
  }
}

function textoCliente(c) {
  return `#${String(c.codigo || 0).padStart(3, '0')} — ${c.nome}`
}

export function Registrar({ salvarRegistro, perfil }) {
  const hoje = new Date().toISOString().slice(0, 10)

  const [clientes, setClientes] = useState([])

  useEffect(() => {
    async function carregarClientes() {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .order('codigo', { ascending: true })

      setClientes(data || [])
    }

    carregarClientes()
  }, [])

  const pessoaDoPerfil = EQUIPE.find(
    p => p.nome?.toLowerCase() === perfil?.nome?.toLowerCase()
  ) || {
    nome: perfil?.nome,
    tipo: perfil?.tipo || 'geral',
    cor: '#B7791F',
  }

  const [pessoaSel, setPessoaSel] = useState(
    perfil?.role === 'admin' ? null : pessoaDoPerfil
  )

  const [form, setForm] = useState(
    perfil?.role === 'admin' ? null : formVazio(hoje)
  )

  const [salvando, setSalvando] = useState(false)

  function selecionarPessoa(p) {
    setPessoaSel(p)
    setForm(formVazio(hoje))
  }

  function voltar() {
    if (perfil?.role !== 'admin') return
    setPessoaSel(null)
    setForm(null)
  }

  function setField(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function setItemField(bi, ii, field, val) {
    setForm(f => {
      const blocos = f.blocos.map((b, bIdx) => {
        if (bIdx !== bi) return b
        return b.map((item, iIdx) =>
          iIdx === ii ? { ...item, [field]: val } : item
        )
      })
      return { ...f, blocos }
    })
  }

  function addItem(bi) {
    setForm(f => {
      const blocos = f.blocos.map((b, bIdx) =>
        bIdx === bi ? [...b, itemVazio()] : b
      )
      return { ...f, blocos }
    })
  }

  function removeItem(bi, ii) {
    setForm(f => {
      const blocos = f.blocos.map((b, bIdx) => {
        if (bIdx !== bi) return b
        return b.filter((_, iIdx) => iIdx !== ii)
      })
      return { ...f, blocos }
    })
  }

  async function salvar() {
    if (!pessoaSel || !form) return
    setSalvando(true)

    const payload = {
      pessoa: pessoaSel.nome,
      tipo: pessoaSel.tipo,
      data: form.date,
      turno: form.turno,
      blocos: form.blocos.map(b =>
        b.filter(i => i.servico || i.cat || i.ev || i.tm || i.st || i.ob || i.ed || i.se)
      ),
    }

    const res = await salvarRegistro(payload)
    setSalvando(false)

    if (res.ok) {
      showToast(`✓ Registro de ${pessoaSel.nome} salvo!`)
      setForm(formVazio(hoje))
    } else {
      showToast(`Erro: ${res.erro}`)
    }
  }

  if (!pessoaSel && perfil?.role === 'admin') {
    return (
      <div>
        <h2 className="section-title">Registrar dia</h2>
        <p className="text-muted mb-4" style={{ fontSize: 13 }}>
          Selecione um colaborador para registrar o dia:
        </p>

        <div className="grid-pessoas">
          {EQUIPE.map(p => (
            <button key={p.nome} className="pessoa-card" onClick={() => selecionarPessoa(p)}>
              <Avatar pessoa={p} size={48} />
              <span className="nome">{p.nome}</span>
              <span className="tipo-badge">
                {p.tipo === 'video' ? 'Vídeo' : p.tipo === 'foto' ? 'Foto' : 'Adm/Mkt'}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {perfil?.role === 'admin' && (
          <button className="btn btn-ghost btn-sm" onClick={voltar}>← Voltar</button>
        )}

        <Avatar pessoa={pessoaSel} size={40} />

        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{pessoaSel.nome}</div>
          <div className="text-xs text-muted">
            {pessoaSel.tipo === 'video'
              ? 'Editor de Vídeo'
              : pessoaSel.tipo === 'foto'
                ? 'Fotógrafo/Editor'
                : 'Administrativo/Marketing'}
          </div>
        </div>

        <div className="flex gap-3 items-center" style={{ marginLeft: 'auto' }}>
          <div>
            <label className="form-label">Data</label>
            <input
              type="date"
              className="form-input"
              style={{ width: 160 }}
              value={form.date}
              onChange={e => setField('date', e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Turno</label>
            <select
              className="form-select"
              style={{ width: 160 }}
              value={form.turno}
              onChange={e => setField('turno', e.target.value)}
            >
              {TURNOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-col gap-4">
        {form.blocos.map((bloco, bi) => (
          <div key={bi} className="bloco">
            <div className="bloco-header" style={{ borderLeft: `3px solid ${pessoaSel.cor}` }}>
              <span>Bloco {bi + 1} — {['9h–11h', '11h–14h', '14h–16h', '16h–18h'][bi]}</span>
              <span style={{ color: pessoaSel.cor }}>
                {bloco.filter(i => i.servico || i.cat || i.ev).length} item(s)
              </span>
            </div>

            {bloco.map((item, ii) => (
              <div key={ii} className="bloco-item" style={{ borderLeftColor: pessoaSel.cor }}>
                <div className="bloco-row cols3 mb-2">
                  <div>
                    <label className="form-label">Serviço</label>
                    <select
                      className="form-select"
                      value={item.servico}
                      onChange={e => setItemField(bi, ii, 'servico', e.target.value)}
                    >
                      <option value="">— Selecionar —</option>
                      {TIPOS_SERVICO.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Categoria</label>
                    <select
                      className="form-select"
                      value={item.cat}
                      onChange={e => setItemField(bi, ii, 'cat', e.target.value)}
                    >
                      <option value="">— Selecionar —</option>
                      {Object.entries(CATEGORIAS).map(([grupo, cats]) => (
                        <optgroup key={grupo} label={grupo}>
                          {cats.map(c => <option key={c} value={c}>{c}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Cliente</label>
                    <select
                      className="form-select"
                      value={item.ev}
                      onChange={e => setItemField(bi, ii, 'ev', e.target.value)}
                    >
                      <option value="">— Selecionar cliente —</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.nome}>
                          {textoCliente(c)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`bloco-row mb-2 ${categoriaShowsE(item.cat) && categoriaShowsS(item.cat) ? 'cols4' : categoriaShowsE(item.cat) || categoriaShowsS(item.cat) ? 'cols3' : 'cols2'}`}>
                  <div>
                    <label className="form-label">Tempo</label>
                    <select
                      className="form-select"
                      value={item.tm}
                      onChange={e => setItemField(bi, ii, 'tm', e.target.value)}
                    >
                      <option value="">—</option>
                      {TEMPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={item.st}
                      onChange={e => setItemField(bi, ii, 'st', e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  {categoriaShowsE(item.cat) && (
                    <div>
                      <label className="form-label">Edições (E)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={item.ed}
                        onChange={e => setItemField(bi, ii, 'ed', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  )}

                  {categoriaShowsS(item.cat) && (
                    <div>
                      <label className="form-label">Seleções (S)</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        value={item.se}
                        onChange={e => setItemField(bi, ii, 'se', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    value={item.ob}
                    onChange={e => setItemField(bi, ii, 'ob', e.target.value)}
                    placeholder="Observação (opcional)"
                  />

                  {ii > 0 && (
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeItem(bi, ii)}
                      title="Remover"
                      style={{ flexShrink: 0 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div style={{ padding: '10px 14px', borderTop: bloco.length > 1 ? '1px solid var(--border-light)' : 'none' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => addItem(bi)}>
                + Adicionar tarefa no bloco {bi + 1}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          style={{ background: pessoaSel.cor, padding: '10px 28px', fontSize: 14 }}
          onClick={salvar}
          disabled={salvando}
        >
          {salvando ? 'Salvando…' : `Salvar registro de ${pessoaSel.nome}`}
        </button>
      </div>
    </div>
  )
}