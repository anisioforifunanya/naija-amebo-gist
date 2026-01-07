import { updateAllNews } from './newsService'

let cronJob: any = null

export function startNewsScheduler() {
  if (cronJob) {
    console.log('News scheduler already running')
    return
  }

  console.log('News scheduler initialized (client-side updates every 15 minutes)')
  updateAllNews().catch((error) => console.error('[Scheduler] Initial update failed:', error))
}

export function stopNewsScheduler() {
  if (cronJob) {
    cronJob = null
    console.log('News scheduler stopped')
  }
}

export function isNewsSchedulerRunning(): boolean {
  return cronJob !== null
}
