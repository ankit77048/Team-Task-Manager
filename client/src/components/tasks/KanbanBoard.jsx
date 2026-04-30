import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon } from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: 'from-slate-500/20 to-slate-500/10',   accent: '#64748b' },
  { id: 'inprogress', label: 'In Progress',  color: 'from-amber-500/20 to-amber-500/10',   accent: '#f59e0b' },
  { id: 'done',       label: 'Done',         color: 'from-emerald-500/20 to-emerald-500/10', accent: '#10b981' },
];

export default function KanbanBoard({ tasks, isAdmin, onEdit, onDelete, onStatusChange, onCreateInColumn }) {
  const [localTasks, setLocalTasks] = useState(tasks);

  // Sync when parent tasks prop changes
  if (JSON.stringify(tasks.map(t => t._id + t.status)) !== JSON.stringify(localTasks.map(t => t._id + t.status))) {
    setLocalTasks(tasks);
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const task = localTasks.find(t => t._id === draggableId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setLocalTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));
    await onStatusChange(draggableId, newStatus);
  };

  const getColumnTasks = (colId) => localTasks.filter(t => t.status === colId);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-b ${col.color} border border-white/5`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.accent }} />
                  <span className="font-semibold text-sm text-slate-200">{col.label}</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300 font-medium">{colTasks.length}</span>
                </div>
                {isAdmin && onCreateInColumn && (
                  <button
                    onClick={() => onCreateInColumn(col.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Droppable column */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-col flex flex-col gap-2 rounded-xl p-2 transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-brand-500/5 border border-brand-500/20' : ''
                    }`}
                  >
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-white/10 text-slate-600 text-sm">
                        No tasks
                      </div>
                    )}
                    {colTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <TaskCard
                            task={task}
                            isAdmin={isAdmin}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                            provided={provided}
                            snapshot={snapshot}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
