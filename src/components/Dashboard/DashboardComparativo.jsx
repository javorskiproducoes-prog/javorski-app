import { useState } from 'react'
import { corLeve } from '../../lib/constants'

const FOTO_ETAPAS = ['Edição de foto', 'Seleção de foto', 'Photoshop / Retoque', 'Exportação — Foto']
const VIDEO_ETAPAS = ['Decupagem', 'Montagem', 'Partes', 'Cor', 'Reels', 'Revisão — Vídeo']

export function DashboardComparativo({ titulo, pessoas, dados, tipo, formatHoras }) {
  const [aberto, setAberto] = useState(null)
  const etapas = tipo === 'foto' ? FOTO_ETAPAS : VIDEO_ETAPAS

  return (
    <div className="card mb-6">
      <div className="card-header">
        <strong>{titulo}</strong>
      </div>

      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .7fr .6fr .6fr .7fr .5fr', gap: 10, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <span>Pessoa</span>
          <span>Horas</span>
          <span>Ed.</span>
          <span>Sel.</span>
          <span>{tipo === 'foto' ? 'Fotos/h' : 'Tarefas'}</span>
          <span></span>
        </div>

        {pessoas.map(p => {
          const d = dados[p.nome] || { minutos: 0, edicoes: 0, selecoes: 0, tarefas: 0, etapas: {} }
          const fotos = d.edicoes + d.selecoes
          const fotosHora = d.minutos > 0 ? Math.round((fotos / (d.minutos / 60)) * 10) / 10 : 0
          const estaAberto = aberto === p.nome

          return (
            <div
              key={p.nome}
              style={{
                background: estaAberto ? corLeve(p.cor) : 'transparent',
                borderLeft: `4px solid ${p.cor}`,
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 6,
                borderTop: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr .7fr .6fr .6fr .7fr .5fr', gap: 10, alignItems: 'center', fontSize: 13 }}>
                <strong style={{ color: p.cor }}>{p.nome}</strong>
                <span>{formatHoras(d.minutos)}</span>
                <span>{d.edicoes.toLocaleString('pt-BR')}</span>
                <span>{d.selecoes.toLocaleString('pt-BR')}</span>
                <span>{tipo === 'foto' ? `${fotosHora}/h` : d.tarefas}</span>

                {tipo !== 'adm' ? (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setAberto(estaAberto ? null : p.nome)}
                  >
                    {estaAberto ? 'Fechar' : 'Ver'}
                  </button>
                ) : (
                  <span>—</span>
                )}
              </div>

              {tipo !== 'adm' && estaAberto && (
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 6 }}>
                  {etapas.map(etapa => (
                    <div key={etapa} style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {etapa}: <strong>{formatHoras(d.etapas[etapa] || 0)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}