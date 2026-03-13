import { useEffect, useState } from 'react';
import { ProjectService } from '@/services/project.service';
import type { Member } from '@/types/project';
import { Button, Card, CardHeader, CardTitle, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label } from '@/components/ui';
import { Plus, Users, Calendar, User } from 'lucide-react';

export const MembersPage = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        employeeCode: '',
        name: '',
        birthday: '',
        joinDate: ''
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        const data = await ProjectService.getMembers();
        setMembers(data);
        setLoading(false);
    };

    const handleCreateMember = async () => {
        if (!newMember.employeeCode.trim() || !newMember.name.trim()) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
            return;
        };
        const isDuplicate = members.some(member => member.employeeCode.toLowerCase() === newMember.employeeCode.trim().toLowerCase());
        if (isDuplicate) {
            alert(`Mã nhân viên "${newMember.employeeCode}" đã tồn tại. Vui lòng sử dụng mã khác.`);
            return;
        }

        await ProjectService.createMember(newMember);
        setNewMember({
            employeeCode: '',
            name: '',
            birthday: '',
            joinDate: ''
        });
        setCreateDialogOpen(false);
        loadMembers();
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm('Xóa nhân viên này?')) return;
        await ProjectService.deleteMember(id);
        loadMembers();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Quản lý nhân viên</h2>
                    <p className="text-muted-foreground">Danh sách nhân viên trong công ty</p>
                </div>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Thêm nhân viên mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employeeCode">Mã nhân viên</Label>
                                    <Input
                                        id="employeeCode"
                                        value={newMember.employeeCode}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, employeeCode: e.target.value }))}
                                        placeholder="VD: NV001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Họ tên</Label>
                                    <Input
                                        id="name"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nhập họ tên"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 ">
                                    <Label htmlFor="birthday">Ngày sinh</Label>
                                    <Input
                                        id="birthday"
                                        type="date"
                                        value={newMember.birthday}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, birthday: e.target.value }))}
                                        
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="joinDate">Ngày vào làm</Label>
                                    <Input
                                        id="joinDate"
                                        type="date"
                                        value={newMember.joinDate}
                                        onChange={(e) => setNewMember(prev => ({ ...prev, joinDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleCreateMember} disabled={!newMember.employeeCode.trim() || !newMember.name.trim()}>
                                Thêm nhân viên
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="text-center p-12">Đang tải dữ liệu...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.length === 0 && (
                        <div className="col-span-full text-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                            <h3 className="mt-2 text-sm font-semibold">Chưa có nhân viên nào</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Bắt đầu bằng cách thêm nhân viên đầu tiên.</p>
                        </div>
                    )}
                    {members.map((member) => (
                        <Card key={member.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-bold">{member.name}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteMember(member.id)}
                                >
                                    ×
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>Mã: {member.employeeCode}</span>
                                    </div>
                                    {member.birthday && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Sinh: {new Date(member.birthday).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    )}
                                    {member.joinDate && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>Vào làm: {new Date(member.joinDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};