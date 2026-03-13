import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectService } from '@/services/project.service';
import type { Project } from '@/types/project';
import { Button, Card, CardHeader, CardTitle, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Plus, Layout, Calendar, CheckCircle2, Clock } from 'lucide-react';

export const ProjectDashboard = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        department: '',
        budget: 0,
        startDate: '',
        endDate: '',
        status: 'PLANNED' as const
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        const data = await ProjectService.getAll();
        setProjects(data);
        setLoading(false);
    };

    const handleCreateProject = async () => {
        if (!newProject.title.trim()) return;

        await ProjectService.create(newProject);
        setNewProject({
            title: '',
            description: '',
            department: '',
            budget: 0,
            startDate: '',
            endDate: '',
            status: 'PLANNED'
        });
        setCreateDialogOpen(false);
        loadProjects();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý dự án</h2>
                    <p className="text-muted-foreground">Theo dõi danh sách dự án và điều phối nguồn lực.</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Tạo dự án mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Tạo dự án mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Tiêu đề</Label>
                                    <Input
                                        id="title"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Nhập tiêu đề dự án"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">Phòng ban</Label>
                                    <Input
                                        id="department"
                                        value={newProject.department}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, department: e.target.value }))}
                                        placeholder="Nhập phòng ban"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Ngày bắt đầu</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={newProject.startDate}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={newProject.endDate}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Ngân sách</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        value={newProject.budget}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select value={newProject.status} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, status: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLANNED">Kế hoạch</SelectItem>
                                            <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
                                            <SelectItem value="DONE">Hoàn thành</SelectItem>
                                            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả</Label>
                                <Textarea
                                    id="description"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Nhập mô tả dự án"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleCreateProject} disabled={!newProject.title.trim()}>
                                Tạo dự án
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Đang triển khai</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold">{projects.filter(p => p.status === 'IN_PROGRESS').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">Dự kiến</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold">{projects.filter(p => p.status === 'PLANNED').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Hoàn thành</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold">{projects.filter(p => p.status === 'DONE').length}</div>
                    </CardContent>
                </Card>
            </div>

            {loading ? (
                <div className="text-center p-12">Đang tải dữ liệu...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 && (
                        <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                            <Layout className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                            <h3 className="mt-2 text-sm font-semibold">Chưa có dự án nào</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Bắt đầu bằng cách tạo dự án đầu tiên của bạn để quản lý các công việc.</p>
                        </div>
                    )}
                    {projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold truncate pr-4">{project.title}</CardTitle>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ring-1 ring-inset ${project.status === 'PLANNED' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                                    project.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 ring-yellow-700/10' :
                                        'bg-green-50 text-green-700 ring-green-700/10'
                                    }`}>
                                    {project.status === 'PLANNED' ? 'Kế hoạch' :
                                        project.status === 'IN_PROGRESS' ? 'Đang chạy' : 'Xong'}
                                </span>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">
                                    {project.description || "Không có mô tả chi tiết cho dự án này."}
                                </p>
                                {project.department && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Phòng ban: {project.department}
                                    </p>
                                )}
                                {project.budget > 0 && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Ngân sách: {project.budget.toLocaleString()} VND
                                    </p>
                                )}
                                <div className="flex justify-between items-center border-t pt-4">
                                    <Link to={`${project.id}/tasks`} className="w-full">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs w-full">Xem chi tiết</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};


