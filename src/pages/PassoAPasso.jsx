export function PassoAPasso() {
  const passos = [
    {
      num: '01',
      titulo: 'Supabase — banco de dados',
      desc: 'Já criado! Project URL: https://hcytbohzikqrjgcubzln.supabase.co',
      detalhe: 'Execute o arquivo supabase-migration.sql no SQL Editor do Supabase (menu lateral → SQL Editor → New Query → colar o conteúdo → Run).',
      status: 'ok',
    },
    {
      num: '02',
      titulo: 'Variáveis de ambiente',
      desc: 'Crie um arquivo .env.local na raiz do projeto com as chaves do Supabase.',
      detalhe: `VITE_SUPABASE_URL=https://hcytbohzikqrjgcubzln.supabase.co\nVITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui`,
      status: 'pendente',
      code: true,
    },
    {
      num: '03',
      titulo: 'GitHub — repositório',
      desc: 'Crie um repositório em github.com/new → nome: javorski-app → Public ou Private → Create.',
      detalhe: 'Depois execute no terminal:\ngit init\ngit add .\ngit commit -m "initial commit"\ngit remote add origin https://github.com/SEU_USUARIO/javorski-app.git\ngit push -u origin main',
      status: 'pendente',
    },
    {
      num: '04',
      titulo: 'Vercel — deploy',
      desc: 'Acesse vercel.com → Add New Project → importe o repositório do GitHub.',
      detalhe: 'Na tela de configuração:\n• Framework Preset: Vite\n• Adicione as variáveis de ambiente:\n  VITE_SUPABASE_URL\n  VITE_SUPABASE_ANON_KEY\n• Clique em Deploy.',
      status: 'pendente',
    },
    {
      num: '05',
      titulo: 'Testar',
      desc: 'Acesse a URL gerada pelo Vercel e teste registrando um dia.',
      detalhe: 'Se aparecer erro de conexão com Supabase, verifique as variáveis de ambiente no painel do Vercel (Settings → Environment Variables).',
      status: 'pendente',
    },
  ]

  return (
    <div>
      <h2 className="section-title">Passo a passo — Deploy</h2>
      <p className="text-muted mb-6" style={{ fontSize: 13 }}>Siga as etapas abaixo para colocar o sistema no ar. Custo: R$ 0,00.</p>

      <div className="flex-col gap-4">
        {passos.map(p => (
          <div key={p.num} className="card" style={{ borderLeft: `4px solid ${p.status === 'ok' ? '#0F6E56' : 'var(--border)'}` }}>
            <div className="card-body">
              <div className="flex items-center gap-3 mb-3">
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 600, color: p.status === 'ok' ? '#0F6E56' : 'var(--text-tertiary)' }}>
                  {p.num}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.titulo}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.desc}</div>
                </div>
                {p.status === 'ok' && (
                  <span className="cat-pill" style={{ marginLeft: 'auto', background: '#D1FAE5', color: '#065F46', border: 'none' }}>✓ Feito</span>
                )}
              </div>
              {p.detalhe && (
                <pre style={{ background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: p.code ? 'monospace' : 'inherit', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  {p.detalhe}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4" style={{ background: '#1C1B18' }}>
        <div className="card-body">
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: '#fff' }}>Stack resumida:</strong><br />
            Frontend: React + Vite · Banco: Supabase (PostgreSQL) · Hospedagem: Vercel<br />
            Custo mensal estimado: <strong style={{ color: '#fff' }}>R$ 0,00</strong> (planos gratuitos)
          </p>
        </div>
      </div>
    </div>
  )
}
