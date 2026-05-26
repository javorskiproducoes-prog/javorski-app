import { useState } from 'react'
import { useRegistros } from './hooks/useRegistros'
import { ToastContainer } from './components/Toast'
import { Registrar } from './pages/Registrar'
import { Dashboard } from './pages/Dashboard'
import { Analise } from './pages/Analise'
import { Historico } from './pages/Historico'
import { Exportar } from './pages/Exportar'
import { PassoAPasso } from './pages/PassoAPasso'

const ABAS = [
  { id: 'registrar', label: 'Registrar' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analise', label: 'Análise' },
  { id: 'historico', label: 'Histórico' },
  { id: 'exportar', label: 'Exportar' },
  { id: 'deploy', label: 'Passo a passo' },
]

export default function App() {
  const [aba, setAba] = useState('registrar')
  const { registros, loading, error, salvarRegistro, deletarRegistro, exportarCSV } = useRegistros()

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">Javorski</span>
          <span className="sub">Produtividade</span>
        </div>
        {registros.length > 0 && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
            {registros.length} registro(s)
          </span>
        )}
      </header>

      <nav className="tabs">
        {ABAS.map(a => (
          <button
            key={a.id}
            className={`tab ${aba === a.id ? 'active' : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.label}
          </button>
        ))}
      </nav>

      <main className="page">
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#DC2626' }}>
            ⚠️ Erro de conexão com Supabase: {error}. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
          </div>
        )}

        {loading && aba !== 'registrar' && aba !== 'deploy' ? (
          <div className="loading">
            <div className="spinner" />
            <span>Carregando dados…</span>
          </div>
        ) : (
          <>
            {aba === 'registrar' && <Registrar salvarRegistro={salvarRegistro} />}
            {aba === 'dashboard' && <Dashboard registros={registros} />}
            {aba === 'analise' && <Analise registros={registros} />}
            {aba === 'historico' && <Historico registros={registros} deletarRegistro={deletarRegistro} />}
            {aba === 'exportar' && <Exportar registros={registros} exportarCSV={exportarCSV} />}
            {aba === 'deploy' && <PassoAPasso />}
          </>
        )}
      </main>

      <ToastContainer />
    </div>
  )
}
