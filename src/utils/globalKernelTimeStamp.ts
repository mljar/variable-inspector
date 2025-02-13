let lastIdleTimestamp: number | null = null;

export function getLastIdleTimestamp(): number | null {
  return lastIdleTimestamp;
}

export function setLastIdleTimestamp(timestamp: number) {
  lastIdleTimestamp = timestamp;
}
