import { EQUIPE, CATEGORIAS, TIPOS_SERVICO } from '../../lib/constants'

export function DashboardFiltros({
  filtroPessoa,
  setFiltroPessoa,
  filtroServico,
  setFiltroServico,
  filtroCategoria,
  setFiltroCategoria,
  buscaCliente,
  setBuscaCliente,
  filtroOrigem,
  setFiltroOrigem,
  periodo,
  setPeriodo,
  dataInicio,
  setDataInicio,
  dataFim,
  setDataFim,
}) {
  return (
    <div className="card card-body mb-6">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
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

        <select className="form-select" value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value)}>
          <option value="oficial">Somente oficiais</option>
          <option value="todos">Incluir antigos</option>
          <option value="legado">Somente antigos</option>
        </select>

        <select className="form-select" value={periodo} onChange={e => setPeriodo(e.target.value)}>
          <option value="hoje">Hoje</option>
          <option value="semana">Semana</option>
          <option value="mes">Mês</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      {periodo === 'custom' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <input className="form-input" type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          <input className="form-input" type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>
      )}
    </div>
  )
}