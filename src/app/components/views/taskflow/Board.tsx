import { useState } from 'react';
import { STATES, canEnter, openBlockers } from '../../../lib/workload';
import type { Project, Task, TaskState } from '../../../lib/data';
import { Column } from './Column';

interface BoardProps {
  tasks: Task[];
  all: Task[];
  projects: Project[];
  sort: (a: Task, b: Task) => number;
  onOpen: (task: Task) => void;
  onMove: (task: Task, state: TaskState) => void;
}

export function Board({ tasks, all, projects, sort, onOpen, onMove }: BoardProps) {
  const [dragged, setDragged] = useState<Task | null>(null);

  const projectOf = (task: Task) => projects.find((row) => row.id === task.projectId);
  const blockersOf = (task: Task) => openBlockers(task, all);

  return (
    <div className="min-w-0 max-w-full overflow-x-auto bg-nt-0 p-4">
      <div className="flex w-max items-start gap-3">
        {STATES.map((state) => (
          <Column
            key={state}
            state={state}
            tasks={tasks.filter((task) => task.state === state).sort(sort)}
            projectOf={projectOf}
            blockersOf={blockersOf}
            dragged={dragged}
            dropOk={dragged === null || canEnter(dragged, state, all)}
            onOpen={onOpen}
            onMove={(task, next) => {
              setDragged(null);
              onMove(task, next);
            }}
            onDragStart={setDragged}
            onDragEnd={() => setDragged(null)}
          />
        ))}
      </div>
    </div>
  );
}
