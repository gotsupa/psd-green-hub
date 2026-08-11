'use client'

import { useEffect, useReducer, useRef, useState } from 'react'

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBulb,
  IconCircleCheck,
  IconLoader2,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react'
import Link from 'next/link'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

import {
  BIN_DETAILS,
  type BinColor,
  getWasteSortingTip,
  WASTE_ITEMS,
  type WasteItem,
} from './data'
import { useSaveGameScore } from './game-score'
import { GameScoreboard } from './game-scoreboard'

import styles from './game.module.css'

type FallingWaste = { id: number; x: number; y: number } & WasteItem
type GameAction =
  | { bin: BinColor; id: number; type: 'sort' }
  | { deltaMs: number; pausedId: null | number; type: 'tick' }
  | { id: number; type: 'select' }
  | { mode: PlayMode; type: 'start' }
  | { type: 'spawn' }
type GameState = {
  correctCount: number
  feedback: string
  items: FallingWaste[]
  level: number
  lives: number
  mistakes: Mistake[]
  mode: PlayMode
  nextId: number
  selectedId: null | number
  sortedCount: number
  status: GameStatus
  timeLeftMs: number
}

type GameStatus = 'idle' | 'over' | 'playing'
type Mistake = {
  chosenBin: BinColor | null
  item: WasteItem
  reason: 'missed' | 'wrong-bin'
}
type PlayMode = 'challenge' | 'learn' | 'practice'

const INITIAL_STATE: GameState = {
  correctCount: 0,
  feedback: '',
  items: [],
  level: 1,
  lives: 3,
  mistakes: [],
  mode: 'challenge',
  nextId: 1,
  selectedId: null,
  sortedCount: 0,
  status: 'idle',
  timeLeftMs: 30_000,
}

const BIN_ICONS: Record<BinColor, string> = {
  blue: '🗑️',
  green: '🍃',
  red: '☣️',
  yellow: '♻️',
}

const PLAY_MODES: {
  description: string
  id: PlayMode
  label: string
  levelBoost: number
  lives: number
  minSpawnMs: number
  spawnMs: number
  speed: number
  timeLimitMs: null | number
}[] = [
  {
    description: 'ไม่มีจับเวลา เหมาะกับการจำสีถังและอ่านเหตุผล',
    id: 'learn',
    label: 'Learn',
    levelBoost: 0.25,
    lives: 99,
    minSpawnMs: 950,
    spawnMs: 1700,
    speed: 5.2,
    timeLimitMs: null,
  },
  {
    description: 'มีเวลา 45 วินาที ฝึกให้คล่องก่อนลงสนามจริง',
    id: 'practice',
    label: 'Practice',
    levelBoost: 0.55,
    lives: 5,
    minSpawnMs: 700,
    spawnMs: 1300,
    speed: 7.2,
    timeLimitMs: 45_000,
  },
  {
    description: 'โหมด 30 วินาที ขยะตกเร็วขึ้นทุกเลเวลสำหรับทดสอบความแม่นยำ',
    id: 'challenge',
    label: 'Challenge',
    levelBoost: 1.1,
    lives: 3,
    minSpawnMs: 520,
    spawnMs: 1050,
    speed: 12,
    timeLimitMs: 30_000,
  },
]
const WASTE_LANES = [4, 23, 42, 61, 80]
const GAME_TICK_MS = 50
const EMPLOYEE_ID_PATTERN = /^\d{7}$/

export function WasteSortGamePage() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const [activeId, setActiveId] = useState<null | number>(null)
  const [employeeId, setEmployeeId] = useState('')
  const [employeeIdTouched, setEmployeeIdTouched] = useState(false)
  const [hoveredId, setHoveredId] = useState<null | number>(null)
  const [playMode, setPlayMode] = useState<PlayMode>(readInitialPlayMode)
  const [roundId, setRoundId] = useState(0)
  const savedRoundIdRef = useRef(0)
  const saveScoreMutation = useSaveGameScore()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor)
  )

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    if (!event.over) return
    dispatch({
      bin: event.over.id as BinColor,
      id: Number(event.active.id),
      type: 'sort',
    })
  }

  function handleDragStart(event: DragStartEvent) {
    setHoveredId(null)
    setActiveId(Number(event.active.id))
  }

  function handleDragCancel() {
    setActiveId(null)
  }

  function handleBinClick(bin: BinColor) {
    if (state.selectedId !== null) {
      setHoveredId(null)
      dispatch({ bin, id: state.selectedId, type: 'sort' })
    }
  }

  function handleStart() {
    if (!EMPLOYEE_ID_PATTERN.test(employeeId)) {
      setEmployeeIdTouched(true)
      return
    }

    setActiveId(null)
    setHoveredId(null)
    saveScoreMutation.reset()
    setRoundId((currentRoundId) => currentRoundId + 1)
    dispatch({ mode: playMode, type: 'start' })
  }

  function handleEmployeeIdChange(value: string) {
    setEmployeeId(value.replace(/\D/g, '').slice(0, 7))
  }

  function handleRetrySave() {
    savedRoundIdRef.current = roundId
    saveScoreMutation.mutate({
      correctCount: state.correctCount,
      employeeId,
      mode: state.mode,
      score: state.correctCount,
      sortedCount: state.sortedCount,
    })
  }

  useEffect(() => {
    if (state.status !== 'playing') return
    const tickTimer = window.setInterval(
      () =>
        dispatch({
          deltaMs: GAME_TICK_MS,
          pausedId: activeId ?? (state.mode === 'challenge' ? null : hoveredId),
          type: 'tick',
        }),
      GAME_TICK_MS
    )
    return () => window.clearInterval(tickTimer)
  }, [activeId, hoveredId, state.mode, state.status])

  useEffect(() => {
    if (state.status !== 'playing') return
    const spawnTimer = window.setInterval(
      () => dispatch({ type: 'spawn' }),
      Math.max(
        getPlayModeConfig(state.mode).minSpawnMs,
        getPlayModeConfig(state.mode).spawnMs - state.level * 80
      )
    )
    dispatch({ type: 'spawn' })
    return () => window.clearInterval(spawnTimer)
  }, [state.level, state.mode, state.status])

  useEffect(() => {
    if (
      state.status !== 'over' ||
      state.mode !== 'challenge' ||
      roundId === 0 ||
      savedRoundIdRef.current === roundId
    ) {
      return
    }

    savedRoundIdRef.current = roundId
    saveScoreMutation.mutate({
      correctCount: state.correctCount,
      employeeId,
      mode: state.mode,
      score: state.correctCount,
      sortedCount: state.sortedCount,
    })
  }, [
    employeeId,
    roundId,
    saveScoreMutation,
    state.correctCount,
    state.mode,
    state.sortedCount,
    state.status,
  ])

  const activeItem = state.items.find((item) => item.id === activeId)
  const selectedItem = state.items.find((item) => item.id === state.selectedId)
  const accuracy =
    state.sortedCount === 0
      ? null
      : Math.round((state.correctCount / state.sortedCount) * 100)
  const timeLeftSeconds = Math.ceil(state.timeLeftMs / 1000)
  const activeModeConfig = getPlayModeConfig(state.mode)
  const timeLabel =
    activeModeConfig.timeLimitMs === null ? 'ฝึก' : String(timeLeftSeconds)
  const shouldShowTimeWarning =
    state.status === 'playing' &&
    activeModeConfig.timeLimitMs !== null &&
    timeLeftSeconds <= 10 &&
    timeLeftSeconds > 0

  return (
    <main className={styles.game} data-mode={state.mode}>
      <div aria-hidden="true" className={styles.sun} />
      <div aria-hidden="true" className={styles.cloud} />

      <div className={styles.topActions}>
        <BackToGamesButton size="sm" />
        {state.status === 'playing' ? (
          <Button
            className={styles.restartButton}
            onClick={handleStart}
            size="sm"
            type="button"
          >
            <IconRefresh aria-hidden="true" data-icon="inline-start" />
            <span>เริ่มใหม่</span>
          </Button>
        ) : null}
      </div>

      <div aria-label="สถานะเกม" className={styles.hud}>
        <div className={styles.hudItem}>
          แยกถูก <span className={styles.hudValue}>{state.correctCount}</span>
        </div>
        <div className={styles.hudItem}>
          เลเวล <span className={styles.hudValue}>{state.level}</span>
        </div>
        <div className={styles.hudItem}>
          โหมด <span className={styles.hudValue}>{activeModeConfig.label}</span>
        </div>
        <div
          className={cn(
            styles.hudItem,
            shouldShowTimeWarning && styles.hudItemWarning
          )}
        >
          เวลา <span className={styles.hudValue}>{timeLabel}</span>
        </div>
        <div className={styles.hudItem}>
          แม่นยำ{' '}
          <span className={styles.hudValue}>
            {accuracy === null ? '-' : `${accuracy}%`}
          </span>
        </div>
        <div
          aria-label={`เหลือ ${state.lives} ชีวิต`}
          className={styles.hudItem}
        >
          {Array.from({ length: 3 }, (_, index) =>
            index < state.lives ? '❤️' : '🤍'
          ).join('')}
        </div>
      </div>

      {state.feedback && state.status === 'playing' ? (
        <div
          aria-live="polite"
          className={styles.feedback}
          key={`${state.feedback}-${state.items.length}`}
        >
          {state.feedback}
        </div>
      ) : null}

      {shouldShowTimeWarning ? (
        <div aria-live="assertive" className={styles.timeWarning} role="status">
          เหลืออีก {timeLeftSeconds} วินาที
        </div>
      ) : null}

      {selectedItem ? (
        <div
          aria-live="polite"
          className={cn(
            styles.sortPrompt,
            shouldShowTimeWarning && styles.sortPromptBelowWarning
          )}
        >
          เลือกถังให้ “{selectedItem.name}”
        </div>
      ) : null}

      <DndContext
        collisionDetection={pointerWithin}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className={styles.playfield}>
          {state.items.map((item) => (
            <DraggableWaste
              item={item}
              key={item.id}
              onHoverChange={(hovered) =>
                setHoveredId(hovered ? item.id : null)
              }
              onSelect={() => dispatch({ id: item.id, type: 'select' })}
              selected={state.selectedId === item.id}
            />
          ))}
        </div>

        <div className={styles.bins}>
          {(['red', 'green', 'blue', 'yellow'] as const).map((color) => (
            <DroppableBin
              color={color}
              highlighted={selectedItem !== undefined}
              key={color}
              onClick={() => handleBinClick(color)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className={cn(styles.waste, styles.dragOverlay)}>
              <WasteCard item={activeItem} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {state.status === 'idle' ? (
        <GameOverlay
          actionDisabled={!EMPLOYEE_ID_PATTERN.test(employeeId)}
          actionLabel="เริ่มเกม"
          afterActions={<GameScoreboard employeeId={employeeId} />}
          icon={<IconPlayerPlay aria-hidden="true" data-icon="inline-start" />}
          onAction={handleStart}
          secondaryAction={<BackToGamesButton size="lg" />}
          title="เกมแยกขยะ 4 สี"
        >
          <p className={styles.panelText}>
            ลากขยะลงถังให้ถูกสี หรือแตะขยะหนึ่งครั้งแล้วเลือกถัง
            เลือกโหมดให้เหมาะกับจังหวะการเรียนก่อนเริ่ม
          </p>
          <EmployeeIdField
            onBlur={() => setEmployeeIdTouched(true)}
            onChange={handleEmployeeIdChange}
            showError={employeeIdTouched}
            value={employeeId}
          />
          <div className={styles.legend}>
            {(['red', 'green', 'blue', 'yellow'] as const).map((color) => (
              <div className={styles.legendItem} key={color}>
                <span className={cn(styles.legendDot, styles[color])}>
                  {BIN_ICONS[color]}
                </span>
                {BIN_DETAILS[color].label}
              </div>
            ))}
          </div>
          <PlayModePicker
            disabled={false}
            mode={playMode}
            onChange={setPlayMode}
          />
        </GameOverlay>
      ) : null}

      {state.status === 'over' ? (
        <GameOverlay
          actionDisabled={saveScoreMutation.isPending}
          actionLabel="เล่นอีกครั้ง"
          afterActions={<GameScoreboard employeeId={employeeId} />}
          icon={<IconRefresh aria-hidden="true" data-icon="inline-start" />}
          onAction={handleStart}
          secondaryAction={<BackToGamesButton size="lg" />}
          title="จบเกม"
        >
          <div className={styles.finalResult}>
            {state.correctCount}/{state.sortedCount}
          </div>
          <div className={styles.roundResult}>
            ผลรอบนี้: แยกถูก {state.correctCount} จาก {state.sortedCount} ครั้ง
          </div>
          <ScoreSaveStatus
            employeeId={employeeId}
            error={saveScoreMutation.error}
            isPending={saveScoreMutation.isPending}
            isSuccess={saveScoreMutation.isSuccess}
            onRetry={handleRetrySave}
          />
          <LearningSummary
            correctCount={state.correctCount}
            mistakes={state.mistakes}
            sortedCount={state.sortedCount}
          />
        </GameOverlay>
      ) : null}
    </main>
  )
}

function BackToGamesButton({ size }: { size: 'lg' | 'sm' }) {
  return (
    <Button
      aria-label="ย้อนกลับหน้าเกมทั้งหมด"
      nativeButton={false}
      render={<Link href="/game" />}
      size={size}
      variant="neutral"
    >
      <IconArrowLeft aria-hidden="true" data-icon="inline-start" />
      <span>ย้อนกลับ</span>
    </Button>
  )
}

function DraggableWaste({
  item,
  onHoverChange,
  onSelect,
  selected,
}: {
  item: FallingWaste
  onHoverChange: (hovered: boolean) => void
  onSelect: () => void
  selected: boolean
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({ id: item.id })
  return (
    <div
      className={styles.wastePosition}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
      }}
    >
      <Button
        {...attributes}
        {...listeners}
        aria-pressed={selected}
        className={styles.waste}
        data-dragging={isDragging}
        data-selected={selected}
        onClick={onSelect}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform) }}
        type="button"
        variant="ghost"
      >
        <WasteCard item={item} />
      </Button>
    </div>
  )
}

function DroppableBin({
  color,
  highlighted,
  onClick,
}: {
  color: BinColor
  highlighted: boolean
  onClick: () => void
}) {
  const { isOver, setNodeRef } = useDroppable({ id: color })
  const detail = BIN_DETAILS[color]
  return (
    <Button
      aria-label={`ทิ้งลงถัง${detail.colorName} ${detail.description}`}
      className={styles.binButton}
      data-active={highlighted}
      data-over={isOver}
      onClick={onClick}
      ref={setNodeRef}
      type="button"
      variant="ghost"
    >
      <span className={cn(styles.binBody, styles[color])}>
        <span className={styles.binLid} />
        <span aria-hidden="true" className={styles.binIcon}>
          {BIN_ICONS[color]}
        </span>
      </span>
      <span className={styles.binLabel}>
        ถัง{detail.colorName}
        <span className={styles.binDescription}>{detail.description}</span>
      </span>
    </Button>
  )
}

function EmployeeIdField({
  onBlur,
  onChange,
  showError,
  value,
}: {
  onBlur: () => void
  onChange: (value: string) => void
  showError: boolean
  value: string
}) {
  const isInvalid = showError && !EMPLOYEE_ID_PATTERN.test(value)

  return (
    <div className={styles.employeeField}>
      <label htmlFor="employee-id">รหัสพนักงาน</label>
      <input
        aria-describedby="employee-id-help"
        aria-invalid={isInvalid}
        autoComplete="off"
        id="employee-id"
        inputMode="numeric"
        maxLength={7}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        pattern="[0-9]{7}"
        placeholder="กรอกรหัส 7 หลัก"
        value={value}
      />
      <p data-error={isInvalid} id="employee-id-help">
        {isInvalid
          ? 'กรุณากรอกรหัสพนักงานเป็นตัวเลขให้ครบ 7 หลัก'
          : 'ใช้รหัสนี้เพื่อบันทึกคะแนนที่มากที่สุดของคุณเพียงรายการเดียว'}
      </p>
    </div>
  )
}

function GameOverlay({
  actionDisabled = false,
  actionLabel,
  afterActions,
  children,
  icon,
  onAction,
  secondaryAction,
  title,
}: {
  actionDisabled?: boolean
  actionLabel: string
  afterActions?: React.ReactNode
  children: React.ReactNode
  icon: React.ReactNode
  onAction: () => void
  secondaryAction?: React.ReactNode
  title: string
}) {
  return (
    <div className={styles.overlay}>
      <section aria-modal="true" className={styles.panel} role="dialog">
        <h1 className={styles.panelTitle}>{title}</h1>
        {children}
        <div className={styles.overlayActions}>
          {secondaryAction}
          <Button
            disabled={actionDisabled}
            onClick={onAction}
            size="lg"
            type="button"
          >
            {icon}
            {actionLabel}
          </Button>
        </div>
        {afterActions}
      </section>
    </div>
  )
}

function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === 'start') {
    const modeConfig = getPlayModeConfig(action.mode)
    return {
      ...INITIAL_STATE,
      lives: modeConfig.lives,
      mode: action.mode,
      status: 'playing',
      timeLeftMs: modeConfig.timeLimitMs ?? 0,
    }
  }
  if (state.status !== 'playing') return state

  if (action.type === 'spawn') {
    if (state.items.length >= 6 || state.selectedId !== null) return state
    const item = WASTE_ITEMS[Math.floor(Math.random() * WASTE_ITEMS.length)]
    const lane = WASTE_LANES[(state.nextId - 1) % WASTE_LANES.length]
    return {
      ...state,
      items: [...state.items, { ...item, id: state.nextId, x: lane, y: -12 }],
      nextId: state.nextId + 1,
    }
  }

  if (action.type === 'select') {
    if (!state.items.some((item) => item.id === action.id)) return state
    return {
      ...state,
      selectedId: state.selectedId === action.id ? null : action.id,
    }
  }

  if (action.type === 'tick') {
    const modeConfig = getPlayModeConfig(state.mode)
    const timeLeftMs =
      modeConfig.timeLimitMs === null
        ? state.timeLeftMs
        : Math.max(0, state.timeLeftMs - action.deltaMs)
    const timeOver = modeConfig.timeLimitMs !== null && timeLeftMs === 0
    const distance =
      ((modeConfig.speed + state.level * modeConfig.levelBoost) *
        action.deltaMs) /
      1000
    const movedItems = state.items.map((item) =>
      item.id === action.pausedId || item.id === state.selectedId
        ? item
        : { ...item, y: item.y + distance }
    )
    const missed = movedItems.filter((item) => item.y >= 100)
    const lives = Math.max(0, state.lives - missed.length)
    const gameOver = (state.mode !== 'learn' && lives === 0) || timeOver
    return {
      ...state,
      feedback: timeOver
        ? 'หมดเวลา! ไปดูสรุปผลกัน'
        : missed.length
          ? 'พลาด! เสีย 1 ชีวิต'
          : state.feedback,
      items: gameOver ? [] : movedItems.filter((item) => item.y < 100),
      lives,
      mistakes: [
        ...state.mistakes,
        ...missed.map((item) => ({
          chosenBin: null,
          item,
          reason: 'missed' as const,
        })),
      ],
      selectedId: null,
      status: gameOver ? 'over' : state.status,
      timeLeftMs,
    }
  }

  const item = state.items.find((candidate) => candidate.id === action.id)
  if (!item) return state
  const correct = item.bin === action.bin
  const correctCount = correct ? state.correctCount + 1 : state.correctCount
  const lives =
    correct || state.mode === 'learn'
      ? state.lives
      : Math.max(0, state.lives - 1)
  const sortedCount = state.sortedCount + 1

  return {
    ...state,
    correctCount,
    feedback: correct
      ? `ถูกต้อง: ${getWasteSortingTip(item)}`
      : `ยังไม่ใช่ ถัง${BIN_DETAILS[item.bin].colorName}: ${getWasteSortingTip(item)}`,
    items:
      lives === 0
        ? []
        : state.items.filter((candidate) => candidate.id !== action.id),
    level: Math.floor(correctCount / 8) + 1,
    lives,
    mistakes: correct
      ? state.mistakes
      : [
          ...state.mistakes,
          { chosenBin: action.bin, item, reason: 'wrong-bin' },
        ],
    selectedId: null,
    sortedCount,
    status:
      (state.mode !== 'learn' && lives === 0) ||
      (state.mode === 'learn' && sortedCount >= 12)
        ? 'over'
        : state.status,
  }
}

function getPlayModeConfig(mode: PlayMode) {
  return PLAY_MODES.find((item) => item.id === mode) ?? PLAY_MODES[2]
}

function LearningSummary({
  correctCount,
  mistakes,
  sortedCount,
}: {
  correctCount: number
  mistakes: Mistake[]
  sortedCount: number
}) {
  const accuracy =
    sortedCount === 0 ? 0 : Math.round((correctCount / sortedCount) * 100)

  return (
    <section className={styles.learningSummary}>
      <div className={styles.learningHeading}>
        <IconBulb aria-hidden="true" />
        <div>
          <h2>ทบทวนก่อนเล่นรอบใหม่</h2>
          <p>
            แยกถูก {correctCount} จาก {sortedCount} ครั้ง ความแม่นยำ {accuracy}%
          </p>
        </div>
      </div>
      {mistakes.length === 0 ? (
        <div className={styles.perfectSummary}>
          เยี่ยมมาก รอบนี้ยังไม่มีรายการที่ต้องทบทวน
        </div>
      ) : null}
      <ul className={styles.mistakeList}>
        {mistakes.map((mistake, index) => {
          const correctBin = BIN_DETAILS[mistake.item.bin]
          const chosenBin = mistake.chosenBin
            ? BIN_DETAILS[mistake.chosenBin]
            : null

          return (
            <li
              className={styles.mistakeItem}
              key={`${mistake.item.name}-${index}`}
            >
              <span aria-hidden="true" className={styles.mistakeEmoji}>
                {mistake.item.emoji}
              </span>
              <div>
                <p className={styles.mistakeTitle}>{mistake.item.name}</p>
                <p className={styles.mistakeExplanation}>
                  {mistake.reason === 'missed'
                    ? 'ยังไม่ได้แยกก่อนตกถึงพื้น'
                    : `คุณเลือกถัง${chosenBin?.colorName}`}
                  {' แต่ควรลง'}
                  <strong>ถัง{correctBin.colorName}</strong>{' '}
                  {getWasteSortingTip(mistake.item)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function PlayModePicker({
  disabled,
  mode,
  onChange,
}: {
  disabled: boolean
  mode: PlayMode
  onChange: (mode: PlayMode) => void
}) {
  return (
    <section aria-label="เลือกโหมดการเล่น" className={styles.modePicker}>
      {PLAY_MODES.map((item) => (
        <Button
          className={styles.modeButton}
          data-active={mode === item.id}
          disabled={disabled}
          key={item.id}
          onClick={() => onChange(item.id)}
          type="button"
          variant={mode === item.id ? 'default' : 'neutral'}
        >
          <strong>{item.label}</strong>
          <span>{item.description}</span>
        </Button>
      ))}
    </section>
  )
}

function readInitialPlayMode(): PlayMode {
  if (typeof window === 'undefined') return 'challenge'

  const mode = new URLSearchParams(window.location.search).get('mode')
  if (mode === 'learn' || mode === 'practice' || mode === 'challenge') {
    return mode
  }

  return 'challenge'
}

function ScoreSaveStatus({
  employeeId,
  error,
  isPending,
  isSuccess,
  onRetry,
}: {
  employeeId: string
  error: Error | null
  isPending: boolean
  isSuccess: boolean
  onRetry: () => void
}) {
  if (isPending) {
    return (
      <div className={styles.saveStatus} role="status">
        <IconLoader2 aria-hidden="true" className={styles.spin} />
        กำลังตรวจสอบคะแนนสูงสุด...
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.saveStatusError} role="alert">
        <IconAlertCircle aria-hidden="true" />
        <span>{error.message}</span>
        <Button onClick={onRetry} size="sm" type="button" variant="neutral">
          ลองบันทึกอีกครั้ง
        </Button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={styles.saveStatusSuccess} role="status">
        <IconCircleCheck aria-hidden="true" />
        ระบบเก็บคะแนนสูงสุดของรหัส {employeeId} ไว้แล้ว
      </div>
    )
  }

  return null
}

function WasteCard({ item }: { item: WasteItem }) {
  return (
    <>
      <span aria-hidden="true" className={styles.wasteVisual}>
        <span className={styles.wasteEmoji}>{item.emoji}</span>
      </span>
      <span className={styles.wasteName}>{item.name}</span>
    </>
  )
}
