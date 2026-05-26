export const EQUIPE = [
  { nome: 'Fernanda', tipo: 'video', cor: '#534AB7', iniciais: 'FE' },
  { nome: 'Leonardo', tipo: 'video', cor: '#BA7517', iniciais: 'LE' },
  { nome: 'Larissa',  tipo: 'video', cor: '#993556', iniciais: 'LA' },
  { nome: 'Gabriel',  tipo: 'foto',  cor: '#185FA5', iniciais: 'GA' },
  { nome: 'Matheus',  tipo: 'foto',  cor: '#0F6E56', iniciais: 'MA' },
  { nome: 'Valéria',  tipo: 'foto',  cor: '#D4537E', iniciais: 'VA' },
  { nome: 'Ana',      tipo: 'adm',   cor: '#2C2C2A', iniciais: 'AN' },
]

export const CATEGORIAS = {
  '🎬 Produção — Vídeo': [
    'Gravação — Ensaio',
    'Gravação — Evento',
    'Gravação — Empresarial',
  ],
  '📷 Produção — Foto': [
    'Fotografia — Ensaio',
    'Fotografia — Evento',
    'Fotografia — Empresarial',
    'Pré-wedding',
    'Saída externa',
    'Estúdio',
    'Ensaio gestante',
  ],
  '🎞 Pós-produção — Vídeo': [
    'Decupagem',
    'Montagem',
    'Partes',
    'Cor',
    'Reels',
    'Revisão — Vídeo',
  ],
  '🖥 Pós-produção — Foto': [
    'Edição de foto',
    'Seleção de foto',
    'Photoshop / Retoque',
    'Exportação — Foto',
  ],
  '⚙️ Operacional': [
    'Manutenção de equipamento',
    'Checagem de kit',
    'Organização de arquivos',
    'Backup',
    'Preparação para evento',
    'Carregamento de baterias',
  ],
  '💼 Administrativo / Comercial': [
    'Atendimento de leads',
    'Contratos',
    'Orçamentos',
    'Follow-up',
    'Reunião com cliente',
    'Negociação',
    'Financeiro',
    'Cobranças',
    'Entregas',
    'E-mails',
  ],
  '📱 Marketing': [
    'Redes sociais',
    'Postagem',
    'Conteúdo / Vídeo',
    'Reels — Marketing',
    'Tráfego pago',
    'Design',
    'Álbuns / Layout',
  ],
  '🤝 Gestão': [
    'Reunião interna',
    'Planejamento',
    'Treinamento',
    'Avaliação de equipe',
    'Organização',
  ],
}

export const TODAS_CATEGORIAS = Object.entries(CATEGORIAS).flatMap(([grupo, cats]) =>
  cats.map(cat => ({ grupo, cat }))
)

export const TEMPOS = [
  '5min', '10min', '15min', '20min', '30min', '45min',
  '1h', '1h15', '1h30', '1h45', '2h',
]

export const TEMPO_EM_MIN = {
  '5min': 5, '10min': 10, '15min': 15, '20min': 20, '30min': 30,
  '45min': 45, '1h': 60, '1h15': 75, '1h30': 90, '1h45': 105, '2h': 120,
}

export const STATUS_OPTIONS = ['—', 'OK', '1/3', '2/3', '3/3', '4/3', 'Em andamento']

export const TURNOS = ['Dia completo', 'Manhã', 'Tarde', 'Noite']

export const categoriaShowsE = (cat) =>
  cat === 'Edição de foto' || cat === 'Photoshop / Retoque'

export const categoriaShowsS = (cat) =>
  cat === 'Edição de foto' || cat === 'Seleção de foto'

export function corLeve(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},0.12)`
}
