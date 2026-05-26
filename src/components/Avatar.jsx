import { corLeve } from '../lib/constants'

export function Avatar({ pessoa, size = 36 }) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: corLeve(pessoa.cor),
        color: pessoa.cor,
        fontSize: size * 0.33,
      }}
    >
      {pessoa.iniciais}
    </div>
  )
}
