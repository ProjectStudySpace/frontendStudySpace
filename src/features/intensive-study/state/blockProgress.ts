export interface ResolveTotalBlocksInput {
  /** `totalBlocks` from the latest session status GET, when known. */
  statusTotalBlocks: number | null;
  session: { pomodoroBlocks?: readonly unknown[] | null } | null;
  /** Block currently shown; the total can never be lower than it. */
  blockNumber: number;
}

/**
 * Total Pomodoro blocks for "Block N of M". The session status GET counts
 * every block the session has (including extra blocks added later), so it is
 * preferred; the session's own blocks cover reads that did not carry it.
 */
export function resolveTotalBlocks({
  statusTotalBlocks,
  session,
  blockNumber,
}: ResolveTotalBlocksInput): number {
  const statusTotal = Number.isFinite(statusTotalBlocks)
    ? (statusTotalBlocks as number)
    : 0;
  const knownBlocks = session?.pomodoroBlocks?.length ?? 0;
  return Math.max(statusTotal, knownBlocks, blockNumber);
}
