import { useState, useEffect } from 'react'
import {
  EQUIPE,
  CATEGORIAS,
  TEMPOS,
  STATUS_OPTIONS,
  TURNOS,
  categoriaShowsE,
  categoriaShowsS
} from '../lib/constants'

import { Avatar } from '../components/Avatar'
import { showToast } from '../components/Toast'

function itemVazio() {
  return {
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
    blocos: [
      blocoVazio(),
      blocoVazio(),
      blocoVazio(),
      blocoVazio(),
    ],
  }
}

export function Registrar({
  salvarRegistro,
  perfil
}) {

  const hoje =
    new Date()
      .toISOString()
      .slice(0,10)

  const pessoaInicial =
    perfil?.role === 'admin'
      ? null
      : {
          nome: perfil.nome,
          tipo: perfil.tipo,
          cor: '#B7791F'
        }

  const [
    pessoaSel,
    setPessoaSel
  ] =
    useState(
      pessoaInicial
    )

  const [
    form,
    setForm
  ] =
    useState(
      pessoaInicial
        ? formVazio(hoje)
        : null
    )

  const [
    salvando,
    setSalvando
  ] =
    useState(false)

  useEffect(() => {

    if (
      perfil?.role !== 'admin'
      &&
      pessoaInicial
    ) {

      setPessoaSel(
        pessoaInicial
      )

      setForm(
        formVazio(
          hoje
        )
      )

    }

  }, [])

  function selecionarPessoa(p) {
    setPessoaSel(p)
    setForm(
      formVazio(
        hoje
      )
    )
  }

  function voltar() {

    if (
      perfil?.role
      !== 'admin'
    ) return

    setPessoaSel(null)
    setForm(null)

  }

  function setField(
    field,
    val
  ) {

    setForm(
      f => ({
        ...f,
        [field]:
          val
      })
    )

  }

  function setItemField(
    bi,
    ii,
    field,
    val
  ) {

    setForm(f => {

      const blocos =
        f.blocos.map(
          (
            b,
            bIdx
          ) => {

            if (
              bIdx !== bi
            ) return b

            return b.map(
              (
                item,
                iIdx
              ) =>
                iIdx === ii
                  ? {
                      ...item,
                      [field]:
                        val
                    }
                  : item
            )

          }
        )

      return {
        ...f,
        blocos
      }

    })

  }

  function addItem(
    bi
  ) {

    setForm(
      f => {

        const blocos =
          f.blocos.map(
            (
              b,
              bIdx
            ) =>
              bIdx === bi
                ? [
                    ...b,
                    itemVazio()
                  ]
                : b
          )

        return {
          ...f,
          blocos
        }

      }
    )

  }

  async function salvar() {

    if (
      !pessoaSel
      ||
      !form
    ) return

    setSalvando(
      true
    )

    const payload = {

      pessoa:
        pessoaSel.nome,

      tipo:
        pessoaSel.tipo,

      data:
        form.date,

      turno:
        form.turno,

      blocos:
        form.blocos.map(
          b =>
            b.filter(
              i =>
                i.cat
                ||
                i.ev
                ||
                i.tm
                ||
                i.st
                ||
                i.ob
                ||
                i.ed
                ||
                i.se
                ||
                i.minutos
            )
        )

    }

    const res =
      await salvarRegistro(
        payload
      )

    setSalvando(
      false
    )

    if (res.ok) {

      showToast(
        `✓ Registro de ${pessoaSel.nome} salvo!`
      )

      setForm(
        formVazio(
          hoje
        )
      )

    } else {

      showToast(
        `Erro: ${res.erro}`
      )

    }

  }

  if (
    !pessoaSel
    &&
    perfil?.role
    === 'admin'
  ) {

    return (

      <div>

        <h2 className="section-title">
          Registrar dia
        </h2>

        <div className="grid-pessoas">

          {EQUIPE.map(
            p => (

              <button
                key={p.nome}
                className="pessoa-card"
                onClick={() =>
                  selecionarPessoa(
                    p
                  )
                }
              >

                <Avatar
                  pessoa={p}
                  size={48}
                />

                <span className="nome">
                  {p.nome}
                </span>

              </button>

            )
          )}

        </div>

      </div>

    )

  }

  return (

    <div>

      <h2 className="section-title">
        Registrar
      </h2>

      <button
        className="btn btn-primary"
        onClick={salvar}
        disabled={salvando}
      >

        {salvando
          ? 'Salvando...'
          : `Salvar registro de ${pessoaSel?.nome}`}

      </button>

    </div>

  )

}