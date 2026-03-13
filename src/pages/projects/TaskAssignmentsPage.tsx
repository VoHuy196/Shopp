import { useEffect, useState } from 'react';
import { ProjectService } from '@/services/project.service';
import type { Project, Member, TaskAssignment, WorkEntry } from '@/types/project';
import { Button, Card, CardHeader, CardTitle, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Plus, UserPlus, Clock, Calendar } from 'lucide-react';

export const TaskAssignmentsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
    const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [workEntryDialogOpen, setWorkEntryDialogOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        taskId: '',
        memberId: ''
    });
    const [newWorkEntry, setNewWorkEntry] = useState({
        taskId: '',
        memberId: '',
        entryDate: '',
        hours: 0,
        description: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [projectsData, membersData, assignmentsData, workEntriesData] = await Promise.all([
            ProjectService.getAll(),
            ProjectService.getMembers(),
            ProjectService.getAssignments(),
            ProjectService.getWorkEntries()
        ]);
        setProjects(projectsData);
        setMembers(membersData);
        setAssignments(assignmentsData);
        setWorkEntries(workEntriesData);
        setLoading(false);
    };

    const handleAssignTask = async () => {
        if (!newAssignment.taskId || !newAssignment.memberId) return;

        await ProjectService.assignTask(newAssignment.taskId, newAssignment.memberId);
        setNewAssignment({ taskId: '', memberId: '' });
        setAssignDialogOpen(false);
        loadData();
    };

    const handleAddWorkEntry = async () => {
        if (!newWorkEntry.taskId || !newWorkEntry.memberId || !newWorkEntry.entryDate || newWorkEntry.hours <= 0) return;

        await ProjectService.addWorkEntry(newWorkEntry);
        setNewWorkEntry({
            taskId: '',
            memberId: '',
            entryDate: '',
            hours: 0,
            description: ''
        });
        setWorkEntryDialogOpen(false);
        loadData();
    };

    const getTaskById = (taskId: string) => {
        for (const project of projects) {
            const task = project.tasks.find(t => t.id === taskId);
            if (task) return { ...task, projectTitle: project.title };
        }
        return null;
    };

    const getMemberById = (memberId: string) => {
        return members.find(m => m.id === memberId);
    };

    const getTotalHoursForTask = (taskId: string) => {
        return workEntries
            .filter(entry => entry.taskId === taskId)
            .reduce((total, entry) => total + entry.hours, 0);
    };

    const allTasks = projects.flatMap(project =>
        project.tasks.map(task => ({ ...task, projectTitle: project.title }))
    );

    if (loading) return <div className="text-center p-12">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Phân công công việc</h2>
                    <p className="text-muted-foreground">Gán task cho nhân viên và theo dõi công số</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <UserPlus className="mr-2 h-4 w-4" /> Gán task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Gán task cho nhân viên</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="taskSelect">Chọn task</Label>
                                    <Select value={newAssignment.taskId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, taskId: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn task" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allTasks.map(task => (
                                                <SelectItem key={task.id} value={task.id}>
                                                    {task.title} ({task.projectTitle})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="memberSelect">Chọn nhân viên</Label>
                                    <Select value={newAssignment.memberId} onValueChange={(value) => setNewAssignment(prev => ({ ...prev, memberId: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhân viên" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map(member => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name} ({member.employeeCode})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={handleAssignTask} disabled={!newAssignment.taskId || !newAssignment.memberId}>
                                    Gán task
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={workEntryDialogOpen} onOpenChange={setWorkEntryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Clock className="mr-2 h-4 w-4" /> Nhập công số
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Nhập công số thực hiện</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="workTaskSelect">Chọn task</Label>
                                        <Select value={newWorkEntry.taskId} onValueChange={(value) => setNewWorkEntry(prev => ({ ...prev, taskId: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn task" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allTasks.map(task => (
                                                    <SelectItem key={task.id} value={task.id}>
                                                        {task.title} ({task.projectTitle})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="workMemberSelect">Chọn nhân viên</Label>
                                        <Select value={newWorkEntry.memberId} onValueChange={(value) => setNewWorkEntry(prev => ({ ...prev, memberId: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn nhân viên" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {members.map(member => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        {member.name} ({member.employeeCode})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="entryDate">Ngày nhập</Label>
                                        <Input
                                            id="entryDate"
                                            type="date"
                                            value={newWorkEntry.entryDate}
                                            onChange={(e) => setNewWorkEntry(prev => ({ ...prev, entryDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hours">Số giờ</Label>
                                        <Input
                                            id="hours"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={newWorkEntry.hours}
                                            onChange={(e) => setNewWorkEntry(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="workDescription">Mô tả công việc</Label>
                                    <Textarea
                                        id="workDescription"
                                        value={newWorkEntry.description}
                                        onChange={(e) => setNewWorkEntry(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Mô tả chi tiết công việc đã thực hiện"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setWorkEntryDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button onClick={handleAddWorkEntry} disabled={!newWorkEntry.taskId || !newWorkEntry.memberId || !newWorkEntry.entryDate || newWorkEntry.hours <= 0}>
                                    Nhập công số
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Assignments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Phân công công việc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {assignments.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    Chưa có phân công nào
                                </div>
                            ) : (
                                assignments.map((assignment) => {
                                    const task = getTaskById(assignment.taskId);
                                    const member = getMemberById(assignment.memberId);
                                    return (
                                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{task?.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {member?.name} ({member?.employeeCode}) • {task?.projectTitle}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Gán ngày: {new Date(assignment.assignedDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{getTotalHoursForTask(assignment.taskId)}h</div>
                                                <div className="text-xs text-muted-foreground">Tổng công</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Work Entries */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Nhật ký công việc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {workEntries.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    Chưa có nhật ký công việc nào
                                </div>
                            ) : (
                                workEntries
                                    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
                                    .slice(0, 10)
                                    .map((entry) => {
                                        const task = getTaskById(entry.taskId);
                                        const member = getMemberById(entry.memberId);
                                        return (
                                            <div key={entry.id} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="font-medium text-sm">{task?.title}</div>
                                                    <div className="text-sm font-bold text-blue-600">{entry.hours}h</div>
                                                </div>
                                                <div className="text-xs text-muted-foreground mb-1">
                                                    {member?.name} • {new Date(entry.entryDate).toLocaleDateString('vi-VN')}
                                                </div>
                                                {entry.description && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {entry.description}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};