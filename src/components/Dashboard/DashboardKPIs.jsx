function Card({ titulo, valor, detalhe, cor = '#1C1B18' }) {
  return (
    <div className="metric-card" style={{ borderTop: `3px solid ${cor}` }}>
      <div className="metric-value" style={{ color: cor }}>{valor}</div>
      <div className="metric-label">{titulo}</div>
      {detalhe && <div className="text-muted" style={{ fontSize: 11, marginTop: 6 }}>{detalhe}</div>}
    </div>
  )
}

export function DashboardKPIs({
  metricas,
  filtrados,
  clientesAtivos,
  tempoMedioTarefa,
  tempoMedioCliente,
  fotosHoraGeral,
  pessoaMaisCarregada,
  clienteMaisPesado,
  gargaloPrincipal,
  horas,
  formatHoras,
}) {
  return (
    <>
      <div className="metric-grid mb-6">
        <Card titulo="Horas totais" valor={horas(metricas.minutos)} detalhe={formatHoras(metricas.minutos)} />
        <Card titulo="Produtivo" valor={horas(metricas.minutosProdutivos)} detalhe={formatHoras(metricas.minutosProdutivos)} cor="#0F6E56" />
        <Card titulo="Eficiência" valor={`${metricas.eficiencia}%`} detalhe="Produtivo x total" cor="#BA7517" />
        <Card titulo="Tarefas" valor={filtrados.length} />
        <Card titulo="Clientes" valor={clientesAtivos} cor="#534AB7" />
      </div>

      <div className="metric-grid mb-6">
        <Card titulo="Horas Foto" valor={horas(metricas.porArea.foto || 0)} detalhe={formatHoras(metricas.porArea.foto || 0)} cor="#185FA5" />
        <Card titulo="Horas Vídeo" valor={horas(metricas.porArea.video || 0)} detalhe={formatHoras(metricas.porArea.video || 0)} cor="#534AB7" />
        <Card titulo="Horas ADM" valor={horas(metricas.porArea.adm || 0)} detalhe={formatHoras(metricas.porArea.adm || 0)} cor="#2C2C2A" />
        <Card titulo="Ausências" valor={horas(metricas.minutosAusencia)} detalhe={formatHoras(metricas.minutosAusencia)} cor="#993556" />
        <Card titulo="Fotos/hora" valor={fotosHoraGeral} cor="#0F6E56" />
      </div>

      <div className="metric-grid mb-6">
        <Card titulo="Edições" valor={metricas.edicoes.toLocaleString('pt-BR')} cor="#185FA5" />
        <Card titulo="Seleções" valor={metricas.selecoes.toLocaleString('pt-BR')} cor="#D4537E" />
        <Card titulo="Média/tarefa" valor={formatHoras(tempoMedioTarefa)} />
        <Card titulo="Média/cliente" valor={formatHoras(tempoMedioCliente)} cor="#534AB7" />
        <Card titulo="Maior gargalo" valor={gargaloPrincipal?.[0] || '—'} detalhe={gargaloPrincipal ? formatHoras(gargaloPrincipal[1]) : ''} cor="#BA7517" />
      </div>

      <div className="metric-grid mb-6">
        <Card titulo="Pessoa mais carregada" valor={pessoaMaisCarregada?.nome || '—'} detalhe={pessoaMaisCarregada ? formatHoras(pessoaMaisCarregada.minutos) : ''} cor={pessoaMaisCarregada?.cor || '#1C1B18'} />
        <Card titulo="Cliente com mais tempo" valor={clienteMaisPesado?.[0] || '—'} detalhe={clienteMaisPesado ? formatHoras(clienteMaisPesado[1]) : ''} cor="#534AB7" />
      </div>
    </>
  )
}