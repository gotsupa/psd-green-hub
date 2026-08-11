import { IconAlertCircle, IconLoader2, IconTrophy } from '@tabler/icons-react'

import { useGameScores } from './game-score'

import styles from './game.module.css'

const DATE_FORMATTER = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const MODE_LABELS = {
  challenge: 'Challenge',
  learn: 'Learn',
  practice: 'Practice',
}

export function GameScoreboard({ employeeId }: { employeeId?: string }) {
  const scoresQuery = useGameScores()

  return (
    <section aria-labelledby="leaderboard-title" className={styles.scoreboard}>
      <div className={styles.scoreboardHeading}>
        <IconTrophy aria-hidden="true" />
        <div>
          <h2 id="leaderboard-title">ตารางคะแนนผู้เล่นทั้งหมด</h2>
          <p>แสดงคะแนนจากรอบล่าสุดของแต่ละรหัสพนักงาน</p>
        </div>
      </div>

      {scoresQuery.isPending ? (
        <div className={styles.scoreboardState} role="status">
          <IconLoader2 aria-hidden="true" className={styles.spin} />
          กำลังโหลดตารางคะแนน
        </div>
      ) : null}

      {scoresQuery.isError ? (
        <div className={styles.scoreboardError} role="alert">
          <IconAlertCircle aria-hidden="true" />
          <span>{scoresQuery.error.message}</span>
          <button onClick={() => scoresQuery.refetch()} type="button">
            ลองใหม่
          </button>
        </div>
      ) : null}

      {scoresQuery.data?.length === 0 ? (
        <div className={styles.scoreboardState}>
          ยังไม่มีคะแนน มาเป็นผู้เล่นคนแรกกัน
        </div>
      ) : null}

      {scoresQuery.data && scoresQuery.data.length > 0 ? (
        <div className={styles.scoreTableScroll}>
          <table className={styles.scoreTable}>
            <thead>
              <tr>
                <th scope="col">อันดับ</th>
                <th scope="col">รหัสพนักงาน</th>
                <th scope="col">คะแนน</th>
                <th scope="col">ความแม่นยำ</th>
                <th scope="col">โหมด</th>
                <th scope="col">เล่นล่าสุด</th>
              </tr>
            </thead>
            <tbody>
              {scoresQuery.data.map((score, index) => (
                <tr
                  data-current={score.employeeId === employeeId}
                  key={score.employeeId}
                >
                  <td>{index + 1}</td>
                  <th scope="row">
                    {score.employeeId}
                    {score.employeeId === employeeId ? (
                      <span className={styles.youBadge}>คุณ</span>
                    ) : null}
                  </th>
                  <td className={styles.scoreValue}>{score.score}</td>
                  <td>{score.accuracy}%</td>
                  <td>{MODE_LABELS[score.mode]}</td>
                  <td>{formatPlayedAt(score.playedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}

function formatPlayedAt(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : DATE_FORMATTER.format(date)
}
