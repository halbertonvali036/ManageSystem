import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  Search,
  SearchX,
} from 'lucide-react'
import { OPEN_EVENT } from '@/components/commandPalette/commandPaletteManager'
import {
  findCommandByPath,
  filterCommands,
  getCommandsForRole,
} from '@/components/commandPalette/commands'
import {
  getRecentCommands,
  recordRecentCommand,
} from '@/components/commandPalette/recentCommands'
import useAuth from '@/hooks/useAuth'

const LISTBOX_ID = 'command-palette-listbox'
const FIRST_INDEX = 0

const toDisplayCommand = (commands, item) => {
  const matched = findCommandByPath(commands, item.path)
  return {
    path: item.path,
    label: item.label,
    section: matched?.section ?? null,
    icon: matched?.icon ?? null,
  }
}

function CommandPalette() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(FIRST_INDEX)

  const inputRef = useRef(null)
  const listRef = useRef(null)
  const previousFocusRef = useRef(null)

  const commands = useMemo(
    () => getCommandsForRole(user?.role),
    [user?.role],
  )

  const open = useCallback(() => {
    if (!isAuthenticated) {
      return
    }
    previousFocusRef.current = document.activeElement
    setIsOpen(true)
  }, [isAuthenticated])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(FIRST_INDEX)
  }, [])

  useEffect(() => {
    const handleOpenEvent = () => open()
    window.addEventListener(OPEN_EVENT, handleOpenEvent)
    return () => window.removeEventListener(OPEN_EVENT, handleOpenEvent)
  }, [open])

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [open])

  useEffect(() => {
    if (!isAuthenticated && isOpen) {
      const handle = window.requestAnimationFrame(close)
      return () => window.cancelAnimationFrame(handle)
    }
    return undefined
  }, [isAuthenticated, isOpen, close])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.requestAnimationFrame(() => inputRef.current?.focus())
      return () => {
        document.body.style.overflow = ''
      }
    }
    const previousFocus = previousFocusRef.current
    previousFocusRef.current = null
    if (
      previousFocus &&
      typeof previousFocus.focus === 'function' &&
      previousFocus.isConnected
    ) {
      previousFocus.focus()
    }
    return undefined
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }
    const handleWindowKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [isOpen, close])

  const recentCommands = useMemo(
    () => (isOpen ? getRecentCommands() : []),
    [isOpen],
  )

  const visibleGroups = useMemo(() => {
    const queryValue = query.trim()
    const roleRecent = recentCommands.filter((item) =>
      findCommandByPath(commands, item.path),
    )
    const recentPaths = new Set(roleRecent.map((item) => item.path))
    const remainingCommands = recentPaths.size
      ? commands.filter((command) => !recentPaths.has(command.path))
      : commands

    let cursor = FIRST_INDEX
    const withIndexes = (groups) =>
      groups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          index: cursor++,
        })),
      }))

    if (queryValue) {
      const recentMatches = filterCommands(roleRecent, queryValue)
      const navMatches = filterCommands(remainingCommands, queryValue)
      return withIndexes([
        ...(recentMatches.length
          ? [
              {
                id: 'recent',
                label: 'Recent',
                items: recentMatches.map((item) =>
                  toDisplayCommand(commands, item),
                ),
              },
            ]
          : []),
        ...(navMatches.length
          ? [
              {
                id: 'results',
                label: 'Results',
                items: navMatches.map((item) =>
                  toDisplayCommand(commands, item),
                ),
              },
            ]
          : []),
      ])
    }

    return withIndexes([
      ...(roleRecent.length
        ? [
            {
              id: 'recent',
              label: 'Recent',
              items: roleRecent.map((item) =>
                toDisplayCommand(commands, item),
              ),
            },
          ]
        : []),
      {
        id: 'nav',
        label: 'Navigation',
        items: remainingCommands.map((item) =>
          toDisplayCommand(commands, item),
        ),
      },
    ])
  }, [query, commands, recentCommands])

  const flatItems = useMemo(
    () => visibleGroups.flatMap((group) => group.items),
    [visibleGroups],
  )

  const displayIndex =
    flatItems.length > 0 ? Math.min(activeIndex, flatItems.length - 1) : 0

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const activeOption = listRef.current?.querySelector(
      '[aria-selected="true"]',
    )
    activeOption?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, activeIndex, query])

  const execute = useCallback(
    (item) => {
      if (!item) {
        return
      }
      recordRecentCommand(item.path, item.label)
      navigate(item.path)
      close()
    },
    [navigate, close],
  )

  const handleInputKeyDown = (event) => {
    const itemCount = Math.max(flatItems.length, 1)
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => (index + 1) % itemCount)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => (index - 1 + itemCount) % itemCount)
        break
      case 'Enter':
        if (flatItems.length > 0) {
          event.preventDefault()
          execute(flatItems[displayIndex])
        }
        break
      case 'Tab':
        event.preventDefault()
        close()
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
      default:
        break
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="command-palette">
      <div
        className="command-palette__backdrop"
        onClick={close}
        aria-hidden="true"
      />
      <div
        className="command-palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Quick search"
      >
        <div className="command-palette__search">
          <Search
            size={20}
            className="command-palette__search-icon"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id="command-palette-input"
            className="command-palette__input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={LISTBOX_ID}
            aria-activedescendant={
              flatItems.length > 0
                ? `command-option-${displayIndex}`
                : undefined
            }
            aria-label="Search pages"
            placeholder="Search pages…"
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(FIRST_INDEX)
            }}
            onKeyDown={handleInputKeyDown}
          />
          <kbd className="command-palette__esc">Esc</kbd>
        </div>

        <div className="command-palette__body" ref={listRef}>
          {flatItems.length > 0 ? (
            <div
              className="command-palette__list"
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Available pages"
            >
              {visibleGroups.map((group) => (
                <div className="command-group" key={group.id}>
                  <div
                    className="command-group__label"
                    role="presentation"
                  >
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const isActive = item.index === displayIndex
                    const Icon = item.icon
                    return (
                      <div
                        key={item.path}
                        id={`command-option-${item.index}`}
                        className={`command-option${
                          isActive ? ' command-option--active' : ''
                        }`}
                        role="option"
                        aria-selected={isActive}
                        onMouseMove={() => setActiveIndex(item.index)}
                        onClick={() => execute(item)}
                      >
                        {Icon ? (
                          <Icon
                            size={18}
                            className="command-option__icon"
                            aria-hidden="true"
                          />
                        ) : null}
                        <span className="command-option__label">
                          {item.label}
                        </span>
                        {item.section ? (
                          <span className="command-option__section">
                            {item.section}
                          </span>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="command-palette__empty">
              <SearchX
                size={22}
                className="command-palette__empty-icon"
                aria-hidden="true"
              />
              <span className="command-palette__empty-title">
                No matching pages found.
              </span>
              <span className="command-palette__empty-text">
                Try a different term such as &ldquo;grades&rdquo; or
                &ldquo;classes&rdquo;.
              </span>
            </div>
          )}
        </div>

        <div className="command-palette__footer">
          <span className="command-palette__hint">
            <kbd className="command-palette__kbd">
              <ArrowUp size={12} aria-hidden="true" />
            </kbd>
            <kbd className="command-palette__kbd">
              <ArrowDown size={12} aria-hidden="true" />
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="command-palette__hint">
            <kbd className="command-palette__kbd">
              <CornerDownLeft size={12} aria-hidden="true" />
            </kbd>
            <span>Open</span>
          </span>
          <span className="command-palette__hint">
            <kbd className="command-palette__kbd">Esc</kbd>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette