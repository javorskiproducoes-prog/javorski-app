import { useMemo, useState } from 'react'
import { EQUIPE, CATEGORIAS, TIPOS_SERVICO, TEMPO_EM_MIN } from '../lib/constants'

import { DashboardFiltros } from '../components/dashboard/DashboardFiltros'
import { DashboardKPIs } from '../components/dashboard/DashboardKPIs'
import { DashboardComparativo } from '../components/dashboard/DashboardComparativo'
import { DashboardCliente360 } from '../components/dashboard/DashboardCliente360'
import { DashboardAusencias } from '../components/dashboard/DashboardAusencias'
import { DashboardRankings } from '../components/dashboard/DashboardRankings'

const CATEGORIAS_OFICIAIS = Object.values(CATEGORIAS).flat()

// DATA OFICIAL DE INÍCIO DO SISTEMA LIMPO
const DATA_CORTE_OFICIAL = '2026-05-27'

function minutosDoEvento(ev) {
  if (Number(ev.tempo_manual_minutos) > 0)
    return Number(ev.tempo_manual_minutos)

  if (Number(ev.horas_calculadas) > 0)
    return Number(ev.horas_calculadas) * 60

  if (TEMPO_EM_MIN[ev.tempo])
    return TEMPO_EM_MIN[ev.tempo]

  if (TEMPO_EM_MIN[ev.tm])
    return TEMPO_EM_MIN[ev.tm]

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
  return (
    EQUIPE.find(
      p => p.nome === nome
    ) || {
      nome,
      cor:'#1C1B18',
      tipo:'geral'
    }
  )
}

function BotaoAba({
ativo,
children,
onClick
}) {
return (

<button
className={
ativo
? 'btn'
: 'btn btn-ghost'
}
onClick={onClick}
type="button"
>
{children}
</button>

)
}

function dataHojeISO() {
return new Date()
.toISOString()
.slice(0,10)
}

function inicioMesISO() {
const hoje = new Date()

return new Date(
hoje.getFullYear(),
hoje.getMonth(),
1
)
.toISOString()
.slice(0,10)
}

export function Analise({
registros
}) {

const [
filtroPessoa,
setFiltroPessoa
] = useState('')

const [
filtroServico,
setFiltroServico
] = useState('')

const [
filtroCategoria,
setFiltroCategoria
] = useState('')

const [
buscaCliente,
setBuscaCliente
] = useState('')

const [
filtroOrigem,
setFiltroOrigem
] = useState(
'oficial'
)

const [
abaAtual,
setAbaAtual
] = useState(
'geral'
)

const [
periodo,
setPeriodo
] = useState(
'mes'
)

const [
dataInicio,
setDataInicio
] = useState(
inicioMesISO()
)

const [
dataFim,
setDataFim
] = useState(
dataHojeISO()
)

const gerarPDF = () => {
window.print()
}

const eventos = useMemo(() => {

const lista=[]

registros.forEach(r=>{

(r.blocos||[])
.forEach(
(bloco,
blocoIndex)=>{

(bloco||[])
.forEach(ev=>{

const categoria=
ev.categoria||
ev.cat||
''

const servico=
ev.servico||
''

const cliente=
ev.projeto||
ev.ev||
''

if(
categoria &&
!CATEGORIAS_OFICIAIS
.includes(
categoria
)
)
return

if(
servico &&
!TIPOS_SERVICO
.includes(
servico
)
)
return

lista.push({

pessoa:r.pessoa,

tipo:r.tipo,

data:r.data,

// REGRA NOVA

origem:

String(
r.data
) >=
DATA_CORTE_OFICIAL

? 'oficial'

: 'legado',

bloco:
blocoIndex+1,

servico,

categoria,

cliente,

tempo:
ev.tempo||
ev.tm||
'',

edicoes:
Number(
ev.edicoes
?? ev.ed
)||0,

selecoes:
Number(
ev.selecoes
?? ev.se
)||0,

minutos:
minutosDoEvento(
ev
)

})

})

})

})

return lista

},[
registros
])

const filtrados=
useMemo(()=>{

return eventos
.filter(ev=>{

if(
filtroOrigem==='oficial' &&
ev.origem!=='oficial'
)
return false

if(
filtroOrigem==='legado' &&
ev.origem!=='legado'
)
return false

if(
filtroPessoa &&
ev.pessoa
!== filtroPessoa
)
return false

if(
filtroServico &&
ev.servico
!== filtroServico
)
return false

if(
filtroCategoria &&
ev.categoria
!== filtroCategoria
)
return false

if(
buscaCliente &&
!String(
ev.cliente
)
.toLowerCase()
.includes(
buscaCliente
.toLowerCase()
)
)
return false

if(
dataInicio &&
String(ev.data)
< dataInicio
)
return false

if(
dataFim &&
String(ev.data)
> dataFim
)
return false

return true

})

},[
eventos,
filtroPessoa,
filtroServico,
filtroCategoria,
buscaCliente,
filtroOrigem,
dataInicio,
dataFim
])

const metricas=
useMemo(()=>{

const porPessoa={}
const porCliente={}
const porCategoria={}
const porServico={}
const ausencias={}

const porArea={
foto:0,
video:0,
adm:0
}

let minutos=0
let edicoes=0
let selecoes=0
let minutosAusencia=0

filtrados.forEach(
ev=>{

const info=
pessoaInfo(
ev.pessoa
)

const ehAusencia=

ev.categoria===
'Ausência'

||

ev.categoria===
'Compromisso externo'

minutos+=
ev.minutos

edicoes+=
ev.edicoes

selecoes+=
ev.selecoes

if(
ehAusencia
)
minutosAusencia+=
ev.minutos

porArea[
info.tipo
]=
(
porArea[
info.tipo
]||0
)+
ev.minutos

})

return {

minutos,

edicoes,

selecoes,

minutosAusencia,

minutosProdutivos:
Math.max(
minutos-
minutosAusencia,
0
),

eficiencia:

minutos>0

?

Math.round(

(
(
minutos-
minutosAusencia
)

/

minutos

)

*100

)

:0,

porPessoa,

porCliente,

porCategoria,

porServico,

ausencias,

porArea

}

},[
filtrados
])

return (

<div
className="
dashboard-print-area
"
>

<div
className="
flex
justify-between
items-center
mb-4
"
>

<div>

<h2
className="
section-title
"
>

Análise
Avançada
v4.3

</h2>

<p
className="
text-muted
"
>

Dados
oficiais:

27/05/2026+

</p>

</div>

<button
className="
btn
btn-ghost
btn-sm
"
onClick={
gerarPDF
}
>

Gerar PDF

</button>

</div>

<div
style={{
display:'flex',
gap:10,
flexWrap:'wrap',
marginBottom:20
}}
>

<BotaoAba
ativo={
abaAtual===
'geral'
}
onClick={()=>
setAbaAtual(
'geral'
)
}
>
Geral
</BotaoAba>

<BotaoAba
ativo={
abaAtual===
'foto'
}
onClick={()=>
setAbaAtual(
'foto'
)
}
>
Foto
</BotaoAba>

<BotaoAba
ativo={
abaAtual===
'video'
}
onClick={()=>
setAbaAtual(
'video'
)
}
>
Vídeo
</BotaoAba>

<BotaoAba
ativo={
abaAtual===
'adm'
}
onClick={()=>
setAbaAtual(
'adm'
)
}
>
ADM
</BotaoAba>

<BotaoAba
ativo={
abaAtual===
'cliente'
}
onClick={()=>
setAbaAtual(
'cliente'
)
}
>
Cliente 360
</BotaoAba>

<BotaoAba
ativo={
abaAtual===
'ausencias'
}
onClick={()=>
setAbaAtual(
'ausencias'
)
}
>
Ausências
</BotaoAba>

<BotaoAba
ativo={
abaAtual===
'rankings'
}
onClick={()=>
setAbaAtual(
'rankings'
)
}
>
Rankings
</BotaoAba>

</div>

<DashboardFiltros
filtroPessoa={filtroPessoa}
setFiltroPessoa={setFiltroPessoa}
filtroServico={filtroServico}
setFiltroServico={setFiltroServico}
filtroCategoria={filtroCategoria}
setFiltroCategoria={setFiltroCategoria}
buscaCliente={buscaCliente}
setBuscaCliente={setBuscaCliente}
filtroOrigem={filtroOrigem}
setFiltroOrigem={setFiltroOrigem}
periodo={periodo}
setPeriodo={setPeriodo}
dataInicio={dataInicio}
setDataInicio={setDataInicio}
dataFim={dataFim}
setDataFim={setDataFim}
/>

<DashboardKPIs
metricas={metricas}
filtrados={filtrados}
clientesAtivos={
0
}
tempoMedioTarefa={
0
}
tempoMedioCliente={
0
}
fotosHoraGeral={
0
}
pessoaMaisCarregada={
null
}
clienteMaisPesado={
null
}
gargaloPrincipal={
null
}
horas={horas}
formatHoras={
formatHoras
}
/>

</div>

)

}