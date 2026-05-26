import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function buscarTudo(tabela, order = 'id') {
  const pageSize = 1000
  let from = 0
  let todos = []

  while (true) {
    const { data, error } = await supabase
      .from(tabela)
      .select('*')
      .order(order, { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) throw error

    todos = todos.concat(data || [])

    if (!data || data.length < pageSize) break

    from += pageSize
  }

  return todos
}

export function useRegistros() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregarRegistros = useCallback(async () => {
    setLoading(true)

    try {
      const regs = await buscarTudo('registros', 'data')
      const blocos = await buscarTudo('blocos', 'numero')
      const eventos = await buscarTudo('eventos', 'ordem')

      const blocoMap = {}

      blocos.forEach(bloco => {
        blocoMap[bloco.id] = {
          ...bloco,
          itens: [],
        }
      })

      eventos.forEach(evento => {
        if (blocoMap[evento.bloco_id]) {
          blocoMap[evento.bloco_id].itens.push({
            ...evento,
            servico: evento.servico || '',
            categoria: evento.categoria || '',
            projeto: evento.projeto || '',
            tempo: evento.tempo || '',
            status: evento.status || '',
            observacao: evento.observacao || '',
            edicoes: Number(evento.edicoes) || 0,
            selecoes: Number(evento.selecoes) || 0,
            cat: evento.categoria || '',
            ev: evento.projeto || '',
            tm: evento.tempo || '',
            st: evento.status || '',
            ob: evento.observacao || '',
            ed: Number(evento.edicoes) || 0,
            se: Number(evento.selecoes) || 0,
          })
        }
      })

      const registroMap = {}

      regs.forEach(registro => {
        registroMap[registro.id] = {
          ...registro,
          blocos: [[], [], [], []],
        }
      })

      Object.values(blocoMap).forEach(bloco => {
        if (registroMap[bloco.registro_id]) {
          registroMap[bloco.registro_id].blocos[bloco.numero - 1] = bloco.itens
        }
      })

      const lista = Object.values(registroMap).sort((a, b) =>
        String(b.data).localeCompare(String(a.data))
      )

      setRegistros(lista)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarRegistros()
  }, [carregarRegistros])

  const salvarRegistro = async (payload) => {
    try {
      const { data: existing } = await supabase
        .from('registros')
        .select('id')
        .eq('pessoa', payload.pessoa)
        .eq('data', payload.data)

      if (existing?.length > 0) {
        await supabase
          .from('registros')
          .delete()
          .eq('id', existing[0].id)
      }

      const { data: reg, error: e1 } = await supabase
        .from('registros')
        .insert({
          pessoa: payload.pessoa,
          tipo: payload.tipo,
          data: payload.data,
          turno: payload.turno,
        })
        .select()
        .single()

      if (e1) throw e1

      for (let i = 0; i < 4; i++) {
        const { data: bloco, error: e2 } = await supabase
          .from('blocos')
          .insert({
            registro_id: reg.id,
            numero: i + 1,
          })
          .select()
          .single()

        if (e2) throw e2

        const itens = payload.blocos[i] || []

        const itensValidos = itens.filter(item =>
          item.servico ||
          item.cat ||
          item.ev ||
          item.tm ||
          item.st ||
          item.ob ||
          item.ed ||
          item.se
        )

        if (itensValidos.length === 0) continue

        const minutosBloco = 120
        const minutosAutomaticos = minutosBloco / itensValidos.length

        const eventosSalvar = itensValidos.map((item, idx) => ({
          bloco_id: bloco.id,
          servico: item.servico || '',
          categoria: item.cat || '',
          projeto: item.ev || '',
          tempo: item.tm || '',
          status: item.st || '',
          observacao: item.ob || '',
          edicoes: Number(item.ed) || 0,
          selecoes: Number(item.se) || 0,
          ordem: idx,
          origem_tempo: 'automatico',
          horas_calculadas: minutosAutomaticos / 60,
        }))

        const { error: e3 } = await supabase
          .from('eventos')
          .insert(eventosSalvar)

        if (e3) throw e3
      }

      await carregarRegistros()

      return { ok: true }
    } catch (err) {
      return {
        ok: false,
        erro: err.message,
      }
    }
  }

  const deletarRegistro = async (id) => {
    const { error } = await supabase
      .from('registros')
      .delete()
      .eq('id', id)

    if (!error) await carregarRegistros()

    return !error
  }

  const exportarCSV = () => {
    const linhas = [[
      'Data',
      'Pessoa',
      'Tipo',
      'Turno',
      'Bloco',
      'Serviço',
      'Categoria',
      'Projeto',
      'Tempo',
      'Edições',
      'Seleções',
      'Status',
      'Observação',
    ]]

    registros.forEach(registro => {
      registro.blocos.forEach((bloco, blocoIndex) => {
        bloco.forEach(evento => {
          linhas.push([
            registro.data,
            registro.pessoa,
            registro.tipo,
            registro.turno,
            blocoIndex + 1,
            evento.servico,
            evento.categoria,
            evento.projeto,
            evento.tempo,
            evento.edicoes,
            evento.selecoes,
            evento.status,
            evento.observacao,
          ])
        })
      })
    })

    const csv = linhas
      .map(linha =>
        linha
          .map(campo => `"${String(campo ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `javorski_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return {
    registros,
    loading,
    error,
    salvarRegistro,
    deletarRegistro,
    exportarCSV,
    recarregar: carregarRegistros,
  }
}