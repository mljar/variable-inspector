const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function fixture() {
  const timers = new Set();
  const notifier = { inProgressSidebar: false, inProgressPanel: false };
  const exports = {};
  const source = fs.readFileSync(
    path.join(
      __dirname,
      '../src/services/notebookExecutionRefreshCoordinator.ts'
    ),
    'utf8'
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS }
    }).outputText,
    {
      exports,
      require(name) {
        if (name === '@jupyterlab/services') {
          return {
            KernelMessage: {
              isStatusMsg: msg => msg.header.msg_type === 'status'
            }
          };
        }
        if (name === '../utils/kernelOperationNotifier') {
          return { kernelOperationNotifier: notifier };
        }
        throw new Error(`Unexpected runtime dependency: ${name}`);
      },
      console,
      setTimeout(fn) {
        timers.add(fn);
        return fn;
      },
      clearTimeout(fn) {
        timers.delete(fn);
      }
    }
  );
  const coordinator = new exports.NotebookExecutionRefreshCoordinator();
  let observer;
  let refreshes = 0;
  const kernel = {
    id: 'notebook-kernel',
    anyMessage: {
      connect(fn) {
        observer = fn;
      },
      disconnect() {
        observer = undefined;
      }
    }
  };
  const unsubscribe = coordinator.subscribe(
    {
      context: {
        sessionContext: {
          session: { kernel },
          kernelChanged: { connect() {}, disconnect() {} }
        }
      }
    },
    () => refreshes++
  );
  return {
    notifier,
    unsubscribe,
    send(id, inspection = false) {
      observer(kernel, {
        direction: 'send',
        msg: {
          header: { msg_type: 'execute_request', msg_id: id },
          metadata: inspection ? { mljar_variable_inspector: true } : {}
        }
      });
    },
    idle(id) {
      observer(kernel, {
        direction: 'recv',
        msg: {
          header: { msg_type: 'status' },
          parent_header: { msg_id: id },
          content: { execution_state: 'idle' }
        }
      });
    },
    flush() {
      for (const fn of Array.from(timers)) {
        timers.delete(fn);
        fn();
      }
      return refreshes;
    }
  };
}

test('a notebook execution during variable inspection still refreshes variables', () => {
  const f = fixture();
  f.notifier.inProgressSidebar = true;
  f.send('inspection', true);
  f.send('user-cell');
  f.idle('inspection');
  f.notifier.inProgressSidebar = false;
  f.idle('user-cell');
  assert.equal(f.flush(), 1);
  f.unsubscribe();
});

test('inspection requests do not create a refresh loop after other inspections finish', () => {
  const f = fixture();
  // Background work may overlap, so a global busy flag cannot identify requests.
  f.send('inspection', true);
  f.idle('inspection');
  assert.equal(f.flush(), 0);
  f.send('user-cell');
  f.idle('unrelated-reply');
  assert.equal(f.flush(), 0);
  f.idle('user-cell');
  assert.equal(f.flush(), 1);
  f.unsubscribe();
});

test('disposing the last view cancels a pending refresh', () => {
  const f = fixture();
  f.send('user-cell');
  f.idle('user-cell');
  f.unsubscribe();
  assert.equal(f.flush(), 0);
});

test('a refresh queued during an inspection survives the earlier task completing', async () => {
  const timers = new Set();
  const exports = {};
  const source = fs.readFileSync(
    path.join(__dirname, '../src/utils/debouncedTaskQueue.ts'),
    'utf8'
  );
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS }
    }).outputText,
    {
      exports,
      console,
      setTimeout(fn) {
        timers.add(fn);
        return fn;
      },
      clearTimeout(fn) {
        timers.delete(fn);
      }
    }
  );
  const queue = new exports.DebouncedTaskQueue();
  let finishInspection;
  let refreshes = 0;
  queue.add(
    () =>
      new Promise(resolve => {
        finishInspection = resolve;
      })
  );
  const firstTimer = Array.from(timers)[0];
  timers.delete(firstTimer);
  const inspection = firstTimer();
  queue.add(() => {
    refreshes++;
  });
  finishInspection();
  await inspection;
  for (const timer of Array.from(timers)) {
    timers.delete(timer);
    await timer();
  }
  assert.equal(refreshes, 1);
  queue.add(() => {
    refreshes++;
  });
  queue.cancel();
  assert.equal(timers.size, 0);
});
