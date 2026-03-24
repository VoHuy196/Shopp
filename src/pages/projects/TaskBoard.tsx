import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectService } from '@/services/project.service';
import type { Project, Task, TaskStatus, TaskType } from '@/types/project';
import { Button, Card, CardHeader, CardTitle, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DialogDescription, DialogFooter } from '@/components/ui';
import { ArrowLeft, Plus, AlertCircle, Clock, Edit2, Trash2, Save } from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string }[] = [
    { id: 'TODO', label: 'Cần làm' },
    { id: 'IN_PROGRESS', label: 'Đang làm' },
    { id: 'TESTING', label: 'Kiểm thử' },
    { id: 'DONE', label: 'Hoàn thành' }
];

const TASK_TYPES: { id: TaskType; label: string; color: string }[] = [
    { id: 'STORY', label: 'Story', color: 'bg-blue-100 text-blue-800' },
    { id: 'BUG', label: 'Bug', color: 'bg-red-100 text-red-800' },
    { id: 'TASK', label: 'Task', color: 'bg-green-100 text-green-800' },
    { id: 'EPIC', label: 'Epic', color: 'bg-purple-100 text-purple-800' }
];

export const TaskBoard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Create State ---
    const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<TaskStatus>('TODO');
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        taskType: 'TASK' as TaskType,
        startDate: '',
        dueDate: '',
        sprint: '',
        priority: 'MEDIUM' as const
    });

    // --- Edit State ---
    const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) loadProject(id);
    }, [id]);

    const loadProject = async (projectId: string) => {
        setLoading(true);
        const data = await ProjectService.getById(projectId);
        if (data) setProject(data);
        setLoading(false);
    };

    // --- Create Handlers ---
    const openCreateTaskDialog = (status: TaskStatus) => {
        setSelectedColumn(status);
        setCreateTaskDialogOpen(true);
    };

    const handleAddTask = async () => {
        if (!newTask.title.trim() || !id) return;

        await ProjectService.addTask(id, {
            ...newTask,
            status: selectedColumn
        });

        setNewTask({
            title: '', description: '', taskType: 'TASK',
            startDate: '', dueDate: '', sprint: '', priority: 'MEDIUM'
        });
        setCreateTaskDialogOpen(false);
        loadProject(id);
    };

    // --- Edit & Delete Handlers ---
    const handleEditClick = (task: Task) => {
        setEditingTask({ ...task });
        setEditTaskDialogOpen(true);
    };

    const handleUpdateTask = async () => {
        if (!editingTask || !id || !editingTask.title.trim()) return;
        setSaving(true);
        try {
            await ProjectService.updateTask(id, editingTask.id, {
                title: editingTask.title,
                description: editingTask.description,
                taskType: editingTask.taskType,
                startDate: editingTask.startDate,
                dueDate: editingTask.dueDate,
                sprint: editingTask.sprint,
                priority: editingTask.priority
            });
            setEditTaskDialogOpen(false);
            setEditingTask(null);
            loadProject(id);
        } catch (error) {
            console.error(error);
            alert("Lỗi khi cập nhật công việc!");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!id) return;
        if (confirm('Bạn có chắc chắn muốn xóa công việc này khỏi bảng?')) {
            await ProjectService.deleteTask(id, taskId);
            loadProject(id);
        }
    };

    const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
        if (id) {
            await ProjectService.updateTaskStatus(id, taskId, newStatus);
            loadProject(id);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Đang tải bảng công việc...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Không tìm thấy dự án</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('..')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
                    <p className="text-muted-foreground text-sm">Bảng công việc Kanban</p>
                </div>
            </div>

            {/* --- Create Task Modal --- */}
            <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>

                        <DialogTitle>Tạo công việc mới</DialogTitle>
                        <DialogDescription>Điền thông tin chi tiết cho thẻ công việc mới trong dự án.</DialogDescription>

                        <DialogDescription>Điền thông tin chi tiết cho thẻ công việc mới.</DialogDescription>
                    </DialogHeader>
                    {/* ... (Giữ nguyên form Create như code cũ) ... */}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="taskTitle">Tiêu đề</Label>
                                <Input id="taskTitle" value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder="Nhập tiêu đề công việc" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="taskType">Loại công việc</Label>
                                <Select value={newTask.taskType} onValueChange={(value: TaskType) => setNewTask(prev => ({ ...prev, taskType: value }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {TASK_TYPES.map(type => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                                <Input id="startDate" type="date" value={newTask.startDate} onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Ngày đến hạn</Label>
                                <Input id="dueDate" type="date" value={newTask.dueDate} onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sprint">Sprint</Label>
                                <Input id="sprint" value={newTask.sprint} onChange={(e) => setNewTask(prev => ({ ...prev, sprint: e.target.value }))} placeholder="VD: Sprint 1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Độ ưu tiên</Label>
                                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Thấp</SelectItem>
                                        <SelectItem value="MEDIUM">Trung bình</SelectItem>
                                        <SelectItem value="HIGH">Cao</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="taskDescription">Mô tả</Label>
                            <Textarea id="taskDescription" value={newTask.description} onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))} placeholder="Nhập mô tả công việc" rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateTaskDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddTask} disabled={!newTask.title.trim()}>Tạo công việc</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Edit Task Modal --- */}
            <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Sửa công việc</DialogTitle>
                        <DialogDescription>Cập nhật thông tin chi tiết cho thẻ công việc này.</DialogDescription>
                    </DialogHeader>
                    {editingTask && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-taskTitle">Tiêu đề *</Label>
                                    <Input 
                                        id="edit-taskTitle" 
                                        value={editingTask.title} 
                                        onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, title: e.target.value }) : null)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-taskType">Loại công việc</Label>
                                    <Select 
                                        value={editingTask.taskType} 
                                        onValueChange={(value: TaskType) => setEditingTask(prev => prev ? ({ ...prev, taskType: value }) : null)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {TASK_TYPES.map(type => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-startDate">Ngày bắt đầu</Label>
                                    <Input 
                                        id="edit-startDate" type="date" 
                                        value={editingTask.startDate || ''} 
                                        onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, startDate: e.target.value }) : null)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-dueDate">Ngày đến hạn</Label>
                                    <Input 
                                        id="edit-dueDate" type="date" 
                                        value={editingTask.dueDate || ''} 
                                        onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, dueDate: e.target.value }) : null)} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-sprint">Sprint</Label>
                                    <Input 
                                        id="edit-sprint" 
                                        value={editingTask.sprint || ''} 
                                        onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, sprint: e.target.value }) : null)} 
                                        placeholder="VD: Sprint 1" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-priority">Độ ưu tiên</Label>
                                    <Select 
                                        value={editingTask.priority} 
                                        onValueChange={(value: any) => setEditingTask(prev => prev ? ({ ...prev, priority: value }) : null)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Thấp</SelectItem>
                                            <SelectItem value="MEDIUM">Trung bình</SelectItem>
                                            <SelectItem value="HIGH">Cao</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-taskDescription">Mô tả</Label>
                                <Textarea 
                                    id="edit-taskDescription" 
                                    value={editingTask.description || ''} 
                                    onChange={(e) => setEditingTask(prev => prev ? ({ ...prev, description: e.target.value }) : null)} 
                                    rows={3} 
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTaskDialogOpen(false)}>Hủy</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleUpdateTask} disabled={saving || !editingTask?.title}>
                            {saving ? 'Đang lưu...' : <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Kanban Board --- */}
            <div className="flex gap-6 overflow-x-auto pb-6">
                {COLUMNS.map((col) => (
                    <div key={col.id} className="min-w-[280px] w-full max-w-[350px] flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-sm uppercase flex items-center gap-2">
                                {col.label}
                                <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] text-muted-foreground">
                                    {project.tasks.filter(t => t.status === col.id).length}
                                </span>
                            </h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCreateTaskDialog(col.id)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="bg-muted/30 p-3 rounded-lg flex-1 min-h-[500px] space-y-3">
                            {project.tasks
                                .filter(t => t.status === col.id)
                                .map((task) => (
                                    <Card key={task.id} className="shadow-sm border-none bg-card hover:ring-1 hover:ring-primary/20 transition-all cursor-move group">
                                        <CardHeader className="p-4 pb-2 space-y-0 flex flex-row items-start justify-between">
                                            <CardTitle className="text-sm font-semibold leading-tight pr-4">
                                                {task.title}
                                            </CardTitle>
                                            {/* --- Action Buttons (Edit / Delete) --- */}
                                            <div className="flex gap-1 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" size="icon" 
                                                    className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                                    onClick={() => handleEditClick(task)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" size="icon" 
                                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${TASK_TYPES.find(t => t.id === task.taskType)?.color || 'bg-gray-100 text-gray-800'}`}>
                                                    {TASK_TYPES.find(t => t.id === task.taskType)?.label || task.taskType}
                                                </span>
                                                {task.sprint && (
                                                    <span className="text-[10px] text-muted-foreground font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {task.sprint}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                                                {task.description}
                                            </p>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                                                    <Clock className="h-3 w-3" />
                                                    Đến hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded ring-1 ring-inset ring-orange-600/10">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {task.priority === 'LOW' ? 'Thấp' : task.priority === 'MEDIUM' ? 'Trung bình' : 'Cao'}
                                                </div>
                                                <select
                                                    className="text-[10px] border-none bg-transparent font-medium focus:ring-0 text-muted-foreground"
                                                    value={task.status}
                                                    onChange={(e) => handleMoveTask(task.id, e.target.value as TaskStatus)}
                                                    aria-label="Thay đổi trạng thái công việc"
                                                    title="Thay đổi trạng thái công việc"
                                                >
                                                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                </select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};