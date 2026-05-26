import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useRegistros() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregarRegistros = useCallback(async () => {
    setLoading(true)
    try {
      const { data: regs, error: e1 } = await supabase
        .from('registros')
        .select('*')
        .order('data', { ascending: false })
      if (e1) throw e1

      const { data: blocos, error: e2 } = await supabase
        .from('blocos')
        .select('*')
      if (e2) throw e2

      const { data: eventos, error: e3 } = await supabase
        .from('eventos')
        .select('*')
        .order('ordem', { ascending: true })
      if (e3) throw e3

      const blocoMap = {}
      blocos.forEach(b => { blocoMap[b.id] = { ...b, itens: [] } })
      eventos.forEach(ev => {
        if (blocoMap[ev.bloco_id]) blocoMap[ev.bloco_id].itens.push(ev)
      })

      const registroMap = {}
      regs.forEach(r => { registroMap[r.id] = { ...r, blocos: [[], [], [], []] } })
      Object.values(blocoMap).forEach(b => {
        if (registroMap[b.registro_id]) {
          registroMap[b.registro_id].blocos[b.numero - 1] = b.itens
        }
      })

      setRegistros(Object.values(registroMap))
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
    // payload: { pessoa, tipo, data, turno, blocos: [[itens], [itens], [itens], [itens]] }
    try {
      // Verifica se já existe registro desse pessoa+data e remove
      const { data: existing } = await supabase
        .from('registros')
        .select('id')
        .eq('pessoa', payload.pessoa)
        .eq('data', payload.data)
      if (existing?.length > 0) {
        await supabase.from('registros').delete().eq('id', existing[0].id)
      }

      const { data: reg, error: e1 } = await supabase
        .from('registros')
        .insert({ pessoa: payload.pessoa, tipo: payload.tipo, data: payload.data, turno: payload.turno })
        .select()
        .single()
      if (e1) throw e1

      for (let i = 0; i < 4; i++) {
        const { data: bloco, error: e2 } = await supabase
          .from('blocos')
          .insert({ registro_id: reg.id, numero: i + 1 })
          .select()
          .single()
        if (e2) throw e2

        const itens = payload.blocos[i] || []
        if (itens.length > 0) {
          const { error: e3 } = await supabase.from('eventos').insert(
            itens.map((item, idx) => ({
              bloco_id: bloco.id,
              categoria: item.cat || '',
              projeto: item.ev || '',
              tempo: item.tm || '',
              status: item.st || '',
              observacao: item.ob || '',
              edicoes: Number(item.ed) || 0,
              selecoes: Number(item.se) || 0,
              ordem: idx,
            }))
          )
          if (e3) throw e3
        }
      }

      await carregarRegistros()
      return { ok: true }
    } catch (err) {
      return { ok: false, erro: err.message }
    }
  }

  const deletarRegistro = async (id) => {
    const { error } = await supabase.from('registros').delete().eq('id', id)
    if (!error) await carregarRegistros()
    return !error
  }

  const exportarCSV = () => {
    const linhas = [['Data', 'Pessoa', 'Tipo', 'Turno', 'Bloco', 'Categoria', 'Projeto', 'Edições', 'Seleções', 'Tempo', 'Status', 'Observação']]
    registros.forEach(r => {
      r.blocos.forEach((bloco, bi) => {
        bloco.forEach(ev => {
          linhas.push([
            r.data, r.pessoa, r.tipo, r.turno, bi + 1,
            ev.categoria, ev.projeto, ev.edicoes, ev.selecoes,
            ev.tempo, ev.status, ev.observacao
          ])
        })
      })
    })
    const csv = linhas.map(l => l.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url
    a.download = `javorski_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  return { registros, loading, error, salvarRegistro, deletarRegistro, exportarCSV, recarregar: carregarRegistros }
}
