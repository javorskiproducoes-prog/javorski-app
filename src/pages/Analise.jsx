import { useMemo, useState } from 'react'
import { EQUIPE, CATEGORIAS, TIPOS_SERVICO, TEMPO_EM_MIN, corLeve } from '../lib/constants'

const CATEGORIAS_OFICIAIS = Object.values(CATEGORIAS).flat()
const FOTO_ETAPAS = ['Edição de foto', 'Seleção de foto', 'Photoshop / Retoque', 'Exportação — Foto']
const VIDEO_ETAPAS = ['Decupagem', 'Montagem', 'Partes', 'Cor', 'Reels', 'Revisão — Vídeo']

function minutosDoEvento(ev) {
  if (Number(ev.tempo_manual_minutos) > 0) return Number(ev.tempo_manual_minutos)
  if (Number(ev.horas_calculadas) > 0) return Number(ev.horas_calculadas) * 60
  if (TEMPO_EM_MIN[ev.tempo]) return TEMPO_EM_MIN[ev.tempo]
  if (TEMPO_EM_MIN[ev.tm]) return TEMPO_EM_MIN[ev.tm]
  return 0
}

function horas(mins) {
  return Math.round((mins / 60) * 10) / 10
}

function formatHoras(mins) {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  if (h && m) return `${h}h ${m}min`
  if (h) return `${h}h`
  return `${m}min`
}

function pessoaInfo(nome) {
  return EQUIPE.find(p => p.nome === nome) || { nome, cor: '#1C1B18', tipo: 'geral' }
}

function Barra({ label, valor, max, cor = '#1C1B18', sufixo = 'h' }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0

  return (
    <div className="barra-wrap">
      <span className="barra-label" style={{ minWidth: 180 }}>{label}</span>
      <div className="barra-track">
        <div className="barra-fill" style={{ width: `${pct}%`, background: cor }} />
      </div>
      <span className="barra-valor">{valor}{sufixo}</span>
    </div>
  )
}

function Card({ titulo, valor, detalhe, cor = '#1C1B18' }) {
  return (
    <div className="metric-card" style={{ borderTop: `3px solid ${cor}` }}>
      <div className="metric-value" style={{ color: cor }}>{valor}</div>
      <div className="metric-label">{titulo}</div>
      {detalhe && <div className="text-muted" style={{ fontSize: 11, marginTop: 6 }}>{detalhe}</div>}
    </div>
  )
}

function TabelaEquipe({ titulo, pessoas, dados, tipo }) {
  return (
    <div className="card mb-6">
      <div className="card-header">
        <strong>{titulo}</strong>
      </div>

      <div className="card-body">
        {pessoas.map(p => {
          const d = dados[p.nome] || { minutos: 0, edicoes: 0, selecoes: 0, tarefas: 0, etapas: {} }
          const fotos = d.edicoes + d.selecoes
          const fotosHora = d.minutos > 0 ? Math.round((fotos / (d.minutos / 60)) * 10) / 10 : 0

          return (
            <div
              key={p.nome}
              style={{
                background: corLeve(p.cor),
                borderLeft: `4px solid ${p.cor}`,
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .7fr .7fr .7fr .7fr', gap: 12, fontSize: 13 }}>
                <strong style={{ color: p.cor }}>{p.nome}</strong>
                <span>{formatHoras(d.minutos)}</span>
                <span>{d.edicoes.toLocaleString('pt-BR')} E</span>
                <span>{d.selecoes.toLocaleString('pt-BR')} S</span>
                <span>{tipo === 'foto' ? `${fotosHora}/h` : `${d.tarefas} tarefas`}</span>
              </div>

              <div style={{ marginTop: 10 }}>
                {(tipo === 'foto' ? FOTO_ETAPAS : VIDEO_ETAPAS).map(etapa => (
                  <div key={etapa} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 3 }}>
                    {etapa}: <strong>{formatHoras(d.etapas[etapa] || 0)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Analise({ registros }) {
  const [filtroPessoa, setFiltroPessoa] = useState('')
  const [filtroServico, setFiltroServico] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [buscaCliente, setBuscaCliente] = useState('')

  const eventos = useMemo(() => {
    const lista = []

    registros.forEach(r => {
      r.blocos.forEach((bloco, blocoIndex) => {
        bloco.forEach(ev => {
          const categoria = ev.categoria || ev.cat || ''
          const servico = ev.servico || ''
          const cliente = ev.projeto || ev.ev || ''

          if (categoria && !CATEGORIAS_OFICIAIS.includes(categoria)) return
          if (servico && !TIPOS_SERVICO.includes(servico)) return

          lista.push({
            pessoa: r.pessoa,
            tipo: r.tipo,
            data: r.data,
            bloco: blocoIndex + 1,
            servico,
            categoria,
            cliente,
            tempo: ev.tempo || ev.tm || '',
            edicoes: Number(ev.edicoes ?? ev.ed) || 0,
            selecoes: Number(ev.selecoes ?? ev.se) || 0,
            minutos: minutosDoEvento(ev),
          })
        })
      })
    })

    return lista.filter(ev =>
      ev.servico || ev.categoria || ev.cliente || ev.tempo || ev.edicoes || ev.selecoes
    )
  }, [registros])

  const filtrados = useMemo(() => {
    return eventos.filter(ev => {
      if (filtroPessoa && ev.pessoa !== filtroPessoa) return false
      if (filtroServico && ev.servico !== filtroServico) return false
      if (filtroCategoria && ev.categoria !== filtroCategoria) return false
      if (buscaCliente && !String(ev.cliente).toLowerCase().includes(buscaCliente.toLowerCase())) return false
      return true
    })
  }, [eventos, filtroPessoa, filtroServico, filtroCategoria, buscaCliente])

  const metricas = useMemo(() => {
    const porPessoa = {}
    const porCategoria = {}
    const porCliente = {}
    const porServico = {}
    const ausencias = {}

    EQUIPE.forEach(p => {
      porPessoa[p.nome] = { minutos: 0, edicoes: 0, selecoes: 0, tarefas: 0, etapas: {} }
    })

    let minutos = 0
    let edicoes = 0
    let selecoes = 0

    filtrados.forEach(ev => {
      minutos += ev.minutos
      edicoes += ev.edicoes
      selecoes += ev.selecoes

      if (!porPessoa[ev.pessoa]) {
        porPessoa[ev.pessoa] = { minutos: 0, edicoes: 0, selecoes: 0, tarefas: 0, etapas: {} }
      }

      porPessoa[ev.pessoa].minutos += ev.minutos
      porPessoa[ev.pessoa].edicoes += ev.edicoes
      porPessoa[ev.pessoa].selecoes += ev.selecoes
      porPessoa[ev.pessoa].tarefas += 1
      porPessoa[ev.pessoa].etapas[ev.categoria] = (porPessoa[ev.pessoa].etapas[ev.categoria] || 0) + ev.minutos

      if (ev.categoria) porCategoria[ev.categoria] = (porCategoria[ev.categoria] || 0) + ev.minutos
      if (ev.cliente) porCliente[ev.cliente] = (porCliente[ev.cliente] || 0) + ev.minutos
      if (ev.servico) porServico[ev.servico] = (porServico[ev.servico] || 0) + ev.minutos

      if (ev.categoria === 'Ausência' || ev.categoria === 'Compromisso externo') {
        ausencias[ev.pessoa] = (ausencias[ev.pessoa] || 0) + ev.minutos
      }
    })

    return { minutos, edicoes, selecoes, porPessoa, porCategoria, porCliente, porServico, ausencias }
  }, [filtrados])

  const fotoPessoas = EQUIPE.filter(p => p.tipo === 'foto')
  const videoPessoas = EQUIPE.filter(p => p.tipo === 'video')
  const admPessoas = EQUIPE.filter(p => p.tipo === 'adm')

  const topCategorias = Object.entries(metricas.porCategoria).sort((a, b) => b[1] - a[1]).slice(0, 12)
  const topClientes = Object.entries(metricas.porCliente).sort((a, b) => b[1] - a[1]).slice(0, 12)
  const topServicos = Object.entries(metricas.porServico).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const topAusencias = Object.entries(metricas.ausencias).sort((a, b) => b[1] - a[1])

  const maxCat = Math.max(...topCategorias.map(([, v]) => horas(v)), 1)
  const maxCli = Math.max(...topClientes.map(([, v]) => horas(v)), 1)
  const maxServ = Math.max(...topServicos.map(([, v]) => horas(v)), 1)
  const maxAus = Math.max(...topAusencias.map(([, v]) => horas(v)), 1)

  const pessoaMaisCarregada = Object.entries(metricas.porPessoa).sort((a, b) => b[1].minutos - a[1].minutos)[0]
  const clienteMaisPesado = topClientes[0]
  const gargaloPrincipal = topCategorias[0]

  const fotosHoraGeral =
    metricas.minutos > 0
      ? Math.round(((metricas.edicoes + metricas.selecoes) / (metricas.minutos / 60)) * 10) / 10
      : 0

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Análise Avançada</h2>
          <p className="text-muted" style={{ fontSize: 13 }}>
            Comparativos separados por função, cliente, serviço e etapa.
          </p>
        </div>

        <button className="btn btn-ghost btn-sm" disabled title="Em breve">
          Gerar PDF
        </button>
      </div>

      <div className="card card-body mb-6">
        <div className="grid grid-4">
          <select className="form-select" value={filtroPessoa} onChange={e => setFiltroPessoa(e.target.value)}>
            <option value="">Todas as pessoas</option>
            {EQUIPE.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
          </select>

          <select className="form-select" value={filtroServico} onChange={e => setFiltroServico(e.target.value)}>
            <option value="">Todos os serviços</option>
            {TIPOS_SERVICO.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="form-select" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option value="">Todas as etapas</option>
            {Object.entries(CATEGORIAS).map(([grupo, cats]) => (
              <optgroup key={grupo} label={grupo}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
          </select>

          <input
            className="form-input"
            placeholder="Buscar cliente..."
            value={buscaCliente}
            onChange={e => setBuscaCliente(e.target.value)}
          />
        </div>
      </div>

      <div className="metric-grid mb-6">
        <Card titulo="Horas totais" valor={horas(metricas.minutos)} detalhe={formatHoras(metricas.minutos)} />
        <Card titulo="Tarefas" valor={filtrados.length} />
        <Card titulo="Edições" valor={metricas.edicoes.toLocaleString('pt-BR')} cor="#185FA5" />
        <Card titulo="Seleções" valor={metricas.selecoes.toLocaleString('pt-BR')} cor="#D4537E" />
        <Card titulo="Fotos/hora" valor={fotosHoraGeral} cor="#0F6E56" />
      </div>

      <div className="metric-grid mb-6">
        <Card
          titulo="Pessoa mais carregada"
          valor={pessoaMaisCarregada?.[0] || '—'}
          detalhe={pessoaMaisCarregada ? formatHoras(pessoaMaisCarregada[1].minutos) : ''}
          cor={pessoaInfo(pessoaMaisCarregada?.[0]).cor}
        />

        <Card
          titulo="Cliente com mais tempo"
          valor={clienteMaisPesado?.[0] || '—'}
          detalhe={clienteMaisPesado ? formatHoras(clienteMaisPesado[1]) : ''}
          cor="#534AB7"
        />

        <Card
          titulo="Maior gargalo"
          valor={gargaloPrincipal?.[0] || '—'}
          detalhe={gargaloPrincipal ? formatHoras(gargaloPrincipal[1]) : ''}
          cor="#BA7517"
        />
      </div>

      <TabelaEquipe
        titulo="📷 Comparativo — Foto"
        pessoas={fotoPessoas}
        dados={metricas.porPessoa}
        tipo="foto"
      />

      <TabelaEquipe
        titulo="🎬 Comparativo — Vídeo"
        pessoas={videoPessoas}
        dados={metricas.porPessoa}
        tipo="video"
      />

      <TabelaEquipe
        titulo="🤝 Comparativo — ADM / Gestão"
        pessoas={admPessoas}
        dados={metricas.porPessoa}
        tipo="adm"
      />

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><strong>🔥 Gargalos por etapa</strong></div>
          <div className="card-body">
            {topCategorias.map(([cat, mins]) => (
              <Barra key={cat} label={cat} valor={horas(mins)} max={maxCat} cor="#BA7517" />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><strong>👥 Tempo por cliente</strong></div>
          <div className="card-body">
            {topClientes.map(([cli, mins]) => (
              <Barra key={cli} label={cli} valor={horas(mins)} max={maxCli} cor="#534AB7" />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><strong>💼 Tempo por serviço</strong></div>
          <div className="card-body">
            {topServicos.map(([serv, mins]) => (
              <Barra key={serv} label={serv} valor={horas(mins)} max={maxServ} cor="#0F6E56" />
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><strong>🚫 Ausências / externos</strong></div>
          <div className="card-body">
            {topAusencias.length === 0 && (
              <p className="text-muted text-sm">Sem ausências no período.</p>
            )}

            {topAusencias.map(([pessoa, mins]) => {
              const info = pessoaInfo(pessoa)
              return (
                <Barra key={pessoa} label={pessoa} valor={horas(mins)} max={maxAus} cor={info.cor} />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}