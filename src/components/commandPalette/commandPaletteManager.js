export const OPEN_EVENT = 'command-palette:open'

export const openCommandPalette = () => {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT))
}