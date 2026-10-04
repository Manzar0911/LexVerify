import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../../models/workflow.model';
import { Button } from '../common/Button';
import { Plus, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface TaskBoardProps {
  tasks: Task[];
  onOpenCreateTask: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onOpenCreateTask,
  onUpdateTaskStatus,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Action Required & Compliance Tasks</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {tasks.length} Total Tasks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-created on Action Required status changes or assigned manually by compliance officers.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCreateTask}
          leftIcon={<Plus className="w-4 h-4 text-slate-500" />}
        >
          Assign New Task
        </Button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Outstanding Tasks</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            All compliance verification requirements and document checks are clear.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 pt-2">
          {tasks.map((task) => {
            const isCompleted = task.status === TaskStatus.COMPLETED;

            return (
              <div
                key={task.id}
                className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() =>
                      onUpdateTaskStatus(
                        task.id,
                        isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED
                      )
                    }
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-slate-400 bg-white text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <p
                      className={`text-xs font-semibold text-slate-900 ${
                        isCompleted ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-medium">
                      <span>Due: {task.dueDate}</span>
                      <span>•</span>
                      <span>Priority: <strong>{task.priority}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      task.priority === TaskPriority.HIGH
                        ? 'error'
                        : task.priority === TaskPriority.MEDIUM
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {task.priority} Priority
                  </Badge>

                  <Badge
                    variant={
                      task.status === TaskStatus.COMPLETED
                        ? 'success'
                        : 'default'
                    }
                    size="sm"
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
