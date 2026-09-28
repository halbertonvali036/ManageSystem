import { useContext, useState } from 'react'
import { DragContext } from '@/hooks/useCanvasDrop'
import { GripVertical } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

export function CanvasDragProvider({ children, onMoveBlock, onMoveSection }) {
  const [source, setSource] = useState(null)
  const [target, setTarget] = useState(null)
  const end = () => { setSource(null); setTarget(null) }
  const move = (item, offset) => (item.kind === 'section' ? onMoveSection : onMoveBlock)?.(item.id, offset)
  return <DragContext.Provider value={{ source, target, setSource, setTarget, end, move }}>{children}</DragContext.Provider>
}

/** Native drag is an enhancement; arrow keys on the grip and existing outline
 * move buttons remain available, including on touch-only devices.
 */
export function CanvasDragHandle({ item }) {
  const drag = useContext(DragContext)
  const { t } = useTranslation()
  return <button type="button" className="canvas-drag-handle" draggable
    aria-label={`${t(item.kind === 'section' ? 'motion.dragSection' : 'motion.dragBlock')}. ${t('motion.dragKeys')}`}
    data-tooltip={t('motion.dragKeys')}
    onClick={(event) => event.stopPropagation()}
    onKeyDown={(event) => {
      event.stopPropagation()
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
        drag.move(item, event.key === 'ArrowUp' ? -1 : 1)
      }
    }}
    onDragStart={(event) => {
      event.stopPropagation()
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', item.id)
      drag.setSource(item)
    }}
    onDragEnd={drag.end}>
    <GripVertical size={14} aria-hidden="true" />
  </button>
}

