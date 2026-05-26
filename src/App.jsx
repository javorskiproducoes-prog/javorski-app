import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useRegistros } from './hooks/useRegistros'
import { ToastContainer } from './components/Toast'
import { Registrar } from './pages/Registrar'
import { Dashboard } from './pages/Dashboard'
import { Analise } from './pages/Analise'
import { Historico } from './pages/Historico'
import { Exportar } from './pages/Exportar'
import { PassoAPasso } from './pages/PassoAPasso'

const ABAS_ADMIN = [
  { id: 'registrar', label: 'Registrar' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analise', label: 'Análise' },
  { id: 'historico', label: 'Histórico' },
  { id: 'exportar', label: 'Exportar' },
  { id: 'deploy', label: 'Passo a passo' },
]

const ABAS_COLAB = [
  { id: 'registrar', label: 'Registrar' },
  { id: 'dashboard', label: 'Meu painel' },
  { id: 'historico', label: 'Meu histórico' },
]

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) setErro(error.message)
    setLoading(false)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">Javorski</span>
          <span className="sub">Produtividade</span>
        </div>
      </header>

      <main className="page" style={{ maxWidth: 420 }}>
        <h2 className="section-title">Entrar no sistema</h2>

        <form onSubmit={entrar} className="card card-body">
          <label className="form-label">E-mail</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label className="form-label mt-3">Senha</label>
          <input
            className="form-input"
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />

          {erro && (
            <p style={{ color: '#DC2626', fontSize: 13 }}>
              {erro}
            </p>
          )}

          <button className="btn btn-primary mt-4" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </main>

      <ToastContainer />
    </div>
  )
}

export default function App() {
  const [aba, setAba] = useState('registrar')
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const {
    registros,
    loading,
    error,
    salvarRegistro,
    deletarRegistro,
    exportarCSV,
  } = useRegistros()

  useEffect(() => {
    async function iniciar() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setAuthLoading(false)
    }

    iniciar()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sessionAtual) => {
      setSession(sessionAtual)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    async function carregarPerfil() {
      if (!session?.user?.id) {
        setPerfil(null)
        return
      }

      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!error) setPerfil(data)
    }

    carregarPerfil()
  }, [session])

  async function sair() {
    await supabase.auth.signOut()
    setPerfil(null)
    setSession(null)
  }

  if (authLoading) {
    return <div className="page">Carregando…</div>
  }

  if (!session) {
    return <Login />
  }

  if (!perfil) {
    return (
      <div className="page">
        <h2>Perfil não encontrado</h2>
        <p>Esse usuário ainda não está cadastrado na tabela perfis.</p>
        <button className="btn btn-primary" onClick={sair}>Sair</button>
      </div>
    )
  }

  const isAdmin = perfil.role === 'admin'

  const registrosVisiveis = isAdmin
    ? registros
    : registros.filter(r => r.pessoa === perfil.nome)

  const abas = isAdmin ? ABAS_ADMIN : ABAS_COLAB

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">Javorski</span>
          <span className="sub">Produtividade</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
            {perfil.nome} · {isAdmin ? 'Admin' : 'Colaborador'}
          </span>

          <button className="btn btn-ghost btn-sm" onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <nav className="tabs">
        {abas.map(a => (
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
            ⚠️ Erro de conexão com Supabase: {error}
          </div>
        )}

        {loading && aba !== 'registrar' && aba !== 'deploy' ? (
          <div className="loading">
            <div className="spinner" />
            <span>Carregando dados…</span>
          </div>
        ) : (
          <>
            {aba === 'registrar' && (
              <Registrar
                salvarRegistro={salvarRegistro}
                perfil={perfil}
              />
            )}

            {aba === 'dashboard' && <Dashboard registros={registrosVisiveis} />}
            {aba === 'analise' && isAdmin && <Analise registros={registrosVisiveis} />}
            {aba === 'historico' && (
              <Historico
                registros={registrosVisiveis}
                deletarRegistro={isAdmin ? deletarRegistro : null}
              />
            )}
            {aba === 'exportar' && isAdmin && (
              <Exportar registros={registrosVisiveis} exportarCSV={exportarCSV} />
            )}
            {aba === 'deploy' && isAdmin && <PassoAPasso />}
          </>
        )}
      </main>

      <ToastContainer />
    </div>
  )
}