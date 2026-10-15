type Task = () => Promise<void> | void;

export class DebouncedTaskQueue {
  // Holds the timer handle.
  private timer: ReturnType<typeof setTimeout> | null = null;
  // Holds the most recently added task.
  private lastTask: Task | null = null;
  private delay: number;

  /**
   * @param delay Time in milliseconds to wait before executing the last task.
   */
  constructor(delay: number = 500) {
    this.delay = delay;
  }

  /**
   * Adds a new task to the queue. Only the last task added within the delay period will be executed.
   * @param task A function representing the task.
   */
  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = null;
    this.lastTask = null;
  }

  add(task: Task): void {
    // Save (or overwrite) the latest task.
    this.lastTask = task;

    // If there’s already a pending timer, clear it.
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // Start (or restart) the timer.
    this.timer = setTimeout(async () => {
      const task = this.lastTask;
      // Clear this timer before awaiting: a running task must not erase a new
      // refresh queued while the kernel is still responding.
      this.lastTask = null;
      this.timer = null;
      if (task) {
        try {
          // Execute the latest task.
          await task();
        } catch (error) {
          console.error('Task execution failed:', error);
        }
      }
    }, this.delay);
  }
}
