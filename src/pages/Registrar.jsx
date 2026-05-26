import { useState } from 'react'
import {
  EQUIPE,
  CATEGORIAS,
  TEMPOS,
  STATUS_OPTIONS,
  TURNOS,
  TIPOS_SERVICO,
  categoriaShowsE,
  categoriaShowsS
} from '../lib/constants'

import { Avatar } from '../components/Avatar'
import { showToast } from '../components/Toast'

function itemVazio() {
  return {
    servico: '',
    cat: '',
    ev: '',
    tm: '',
    st: '',
    ob: '',
    ed: '',
    se: '',
    minutos: '',
  }
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

export function Registrar({ salvarRegistro, perfil }) {
  const hoje = new Date().toISOString().slice(0, 10)

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
    perfil?.role === 'admin'
      ? null
      : formVazio(hoje)
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
          iIdx === ii
            ? { ...item, [field]: val }
            : item
        )
      })

      return {
        ...f,
        blocos
      }
    })
  }

  function addItem(bi) {
    setForm(f => {
      const blocos = f.blocos.map(
        (b, bIdx) =>
          bIdx === bi
            ? [...b, itemVazio()]
            : b
      )

      return {
        ...f,
        blocos
      }
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

      blocos: form.blocos.map(
        b =>
          b.filter(
            i =>
              i.servico ||
              i.cat ||
              i.ev ||
              i.tm ||
              i.st ||
              i.ob ||
              i.ed ||
              i.se ||
              i.minutos
          )
      )
    }

    const res = await salvarRegistro(payload)

    setSalvando(false)

    if (res.ok) {
      showToast(
        `✓ Registro de ${pessoaSel.nome} salvo!`
      )

      setForm(
        formVazio(hoje)
      )
    } else {
      showToast(
        `Erro: ${res.erro}`
      )
    }
  }

  if (!pessoaSel && perfil?.role === 'admin') {
    return (
      <div>

        <h2 className="section-title">
          Registrar dia
        </h2>

        <div className="grid-pessoas">
          {EQUIPE.map(p => (
            <button
              key={p.nome}
              className="pessoa-card"
              onClick={() =>
                selecionarPessoa(p)
              }
            >
              <Avatar pessoa={p} size={48} />
              <span className="nome">
                {p.nome}
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
          <button
            className="btn btn-ghost btn-sm"
            onClick={voltar}
          >
            ← Voltar
          </button>
        )}

        <Avatar pessoa={pessoaSel} size={40} />

      </div>

      {form.blocos.map((bloco, bi) => (

        <div
          key={bi}
          className="bloco"
        >

          <div className="bloco-header">

            <span>
              Bloco {bi + 1} —
              {
                [
                  '9h–11h',
                  '11h–14h',
                  '14h–16h',
                  '16h–18h'
                ][bi]
              }
            </span>

          </div>

          {bloco.map((item, ii) => (

            <div
              key={ii}
              className="bloco-item"
            >

              <div className="bloco-row cols3 mb-2">

                <div>

                  <label className="form-label">
                    Serviço
                  </label>

                  <select
                    className="form-select"
                    value={item.servico}
                    onChange={e =>
                      setItemField(
                        bi,
                        ii,
                        'servico',
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      —
                    </option>

                    {TIPOS_SERVICO.map(
                      s => (
                        <option
                          key={s}
                        >
                          {s}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label className="form-label">
                    Categoria
                  </label>

                  <select
                    className="form-select"
                    value={item.cat}
                    onChange={e =>
                      setItemField(
                        bi,
                        ii,
                        'cat',
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      —
                    </option>

                    {Object.entries(
                      CATEGORIAS
                    ).map(
                      ([grupo, cats]) => (
                        <optgroup
                          key={grupo}
                          label={grupo}
                        >

                          {cats.map(
                            c => (
                              <option
                                key={c}
                              >
                                {c}
                              </option>
                            )
                          )}

                        </optgroup>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label className="form-label">
                    Projeto / Evento
                  </label>

                  <input
                    className="form-input"
                    value={item.ev}
                    onChange={e =>
                      setItemField(
                        bi,
                        ii,
                        'ev',
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>

          ))}

        </div>

      ))}

      <button
        className="btn btn-primary"
        onClick={salvar}
        disabled={salvando}
      >

        {salvando
          ? 'Salvando...'
          : `Salvar registro de ${pessoaSel.nome}`}

      </button>

    </div>
  )
}