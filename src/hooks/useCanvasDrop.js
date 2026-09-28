import { createContext, useContext } from 'react'

export const DragContext = createContext(null)

export function useCanvasDrop(item, enabled) {
  const drag = useContext(DragContext)
  if (!enabled || !drag) return {}
  const valid = drag.source && drag.source.kind === item.kind && drag.source.id !== item.id
    && drag.source.sectionId === item.sectionId
  const isTarget = valid && drag.target === item.id
  return {
    'data-dragging': drag.source?.id === item.id ? 'true' : undefined,
    'data-drop-position': isTarget ? (drag.source.index < item.index ? 'after' : 'before') : undefined,
    onDragOver: (event) => {
      if (!valid) return
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'move'
      if (drag.target !== item.id) drag.setTarget(item.id)
    },
    onDragLeave: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget) && drag.target === item.id) drag.setTarget(null)
    },
    onDrop: (event) => {
      if (!valid) return
      event.preventDefault()
      event.stopPropagation()
      drag.move(drag.source, item.index - drag.source.index)
      drag.end()
    },
  }
}
