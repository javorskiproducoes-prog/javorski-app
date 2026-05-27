import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { showToast } from '../components/Toast'

function limparInstagram(valor) {
  return String(valor || '')
    .trim()
    .replace(/^@+/, '')
}

function formatarInstagram(valor) {
  if (!valor) return ''
  return valor.startsWith('@')
    ? valor
    : `@${valor}`
}

function finalTelefone(valor) {
  const nums = String(
    valor || ''
  ).replace(/\D/g,'')

  if(!nums)
    return ''

  return nums.slice(-4)
}

function codigoCliente(codigo){
  return `#${String(
    codigo || 0
  ).padStart(
    3,
    '0'
  )}`
}

export function Clientes(){

  const [clientes,setClientes] =
    useState([])

  const [loading,setLoading] =
    useState(true)

  const [salvando,setSalvando] =
    useState(false)

  const [busca,setBusca] =
    useState('')

  const [nome,setNome] =
    useState('')

  const [telefone,setTelefone] =
    useState('')

  const [instagram,setInstagram] =
    useState('')

  const [observacao,setObservacao] =
    useState('')

  async function carregar(){

    setLoading(true)

    const {
      data,
      error
    } =
    await supabase
      .from(
        'clientes'
      )
      .select('*')
      .order(
        'codigo',
        {
          ascending:true
        }
      )

    if(error){

      showToast(
        error.message
      )

      setClientes([])

    }else{

      setClientes(
        data || []
      )

    }

    setLoading(false)

  }

  useEffect(()=>{

    carregar()

  },[])

  const clientesFiltrados =
    useMemo(()=>{

      const q =
        busca
        .trim()
        .toLowerCase()

      if(!q)
        return clientes

      return clientes.filter(
        c=>

          String(
            c.nome || ''
          )
          .toLowerCase()
          .includes(q)

          ||

          String(
            c.telefone || ''
          )
          .includes(q)

          ||

          String(
            c.instagram || ''
          )
          .toLowerCase()
          .includes(q)

          ||

          String(
            c.observacao || ''
          )
          .toLowerCase()
          .includes(q)

          ||

          String(
            c.codigo || ''
          )
          .includes(q)

      )

    },[
      busca,
      clientes
    ])

  async function salvarCliente(e){

    e.preventDefault()

    if(
      !nome.trim()
    ){

      showToast(
        'Informe o nome do cliente'
      )

      return

    }

    setSalvando(true)

    const {
      error
    } =
    await supabase
      .from(
        'clientes'
      )
      .insert({

        nome:
          nome.trim(),

        telefone:
          telefone.trim(),

        instagram:
          limparInstagram(
            instagram
          ),

        observacao:
          observacao.trim(),

        ativo:true

      })

    setSalvando(false)

    if(error){

      showToast(
        error.message
      )

      return

    }

    setNome('')
    setTelefone('')
    setInstagram('')
    setObservacao('')

    await carregar()

    showToast(
      'Cliente cadastrado'
    )

  }

  return(

    <div>

      <div
        className="flex justify-between items-center mb-4"
      >

        <div>

          <h2
            className="section-title"
            style={{
              marginBottom:4
            }}
          >

            Clientes

          </h2>

          <div
            className="text-muted"
            style={{
              fontSize:13
            }}
          >

            Cadastro único para usar nos blocos e dashboards

          </div>

        </div>

        <button

          className="btn btn-ghost btn-sm"

          onClick={
            carregar
          }

        >

          Recarregar

        </button>

      </div>

      <div
        style={{

          display:'grid',

          gridTemplateColumns:
            '380px 1fr',

          gap:20,

          alignItems:
            'start'

        }}
      >

        <form

          className="card card-body"

          onSubmit={
            salvarCliente
          }

        >

          <h3>

            Novo cliente

          </h3>

          <label>

            Nome

          </label>

          <input

            className="form-input"

            value={nome}

            onChange={e=>
              setNome(
                e.target.value
              )
            }

            placeholder="Bianca e Leonardo"

          />

          <label>

            Telefone

          </label>

          <input

            className="form-input"

            value={telefone}

            onChange={e=>
              setTelefone(
                e.target.value
              )
            }

          />

          <label>

            Instagram

          </label>

          <input

            className="form-input"

            value={instagram}

            onChange={e=>
              setInstagram(
                e.target.value
              )
            }

            placeholder="@cliente"

          />

          <label>

            Observação

          </label>

          <input

            className="form-input"

            value={observacao}

            onChange={e=>
              setObservacao(
                e.target.value
              )
            }

            placeholder="Casamento 2026"

          />

          <br />

          <button
            className="btn btn-primary"
          >

            {
              salvando
              ? 'Salvando...'
              : 'Salvar cliente'
            }

          </button>

        </form>

        <div
          className="card card-body"
        >

          <div
            className="flex justify-between items-center mb-4"
          >

            <h3>

              Clientes cadastrados

            </h3>

            <span
              className="text-muted"
            >

              {
                clientesFiltrados.length
              }

            </span>

          </div>

          <input

            className="form-input"

            placeholder="Buscar cliente, código, instagram..."

            value={busca}

            onChange={e=>
              setBusca(
                e.target.value
              )
            }

          />

          <br />

          {

            loading

            ? (

              <p>

                Carregando...

              </p>

            )

            :

            clientesFiltrados.map(
              c=>(

                <div

                  key={c.id}

                  style={{

                    padding:
                      '14px 0',

                    borderBottom:
                      '1px solid rgba(0,0,0,.08)',

                    display:'flex',

                    justifyContent:
                      'space-between',

                    gap:20

                  }}

                >

                  <div>

                    <div
                      style={{

                        display:'flex',

                        gap:10,

                        alignItems:
                          'center',

                        flexWrap:
                          'wrap'

                      }}
                    >

                      <span
                        className="cat-pill"
                      >

                        {
                          codigoCliente(
                            c.codigo
                          )
                        }

                      </span>

                      <strong>

                        {c.nome}

                      </strong>

                    </div>

                    <div
                      style={{

                        marginTop:6,

                        fontSize:12,

                        color:
                        'var(--text-secondary)',

                        display:'flex',

                        gap:10,

                        flexWrap:
                          'wrap'

                      }}
                    >

                      {

                        c.instagram &&

                        <span>

                          {
                            formatarInstagram(
                              c.instagram
                            )
                          }

                        </span>

                      }

                      {

                        c.telefone &&

                        <span>

                          Tel final {

                            finalTelefone(
                              c.telefone
                            )

                          }

                        </span>

                      }

                      {

                        c.observacao &&

                        <span>

                          {
                            c.observacao
                          }

                        </span>

                      }

                    </div>

                  </div>

                  <span
                    className="cat-pill"
                  >

                    Ativo

                  </span>

                </div>

              )
            )

          }

        </div>

      </div>

    </div>

  )

}