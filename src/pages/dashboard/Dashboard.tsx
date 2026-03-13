import { useEffect, useState } from 'react';
import { DashboardService, ProductService } from '@/services'; // Thêm ProductService
import type { DashboardMetrics, Product } from '@/types'; // Thêm Product type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Package, AlertTriangle, BadgeDollarSign, ArrowRight } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const Dashboard = () => {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [products, setProducts] = useState<Product[]>([]); // Thêm state products
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // Load cả Metrics và Products song song
                const [metricsData, productsData] = await Promise.all([
                    DashboardService.getMetrics(),
                    ProductService.getAll()
                ]);
                setMetrics(metricsData);
                setProducts(productsData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu tổng quan...</div>;
    if (!metrics) return <div className="p-8 text-center text-red-500">Không tải được dữ liệu.</div>;

    // --- Logic lọc sản phẩm tồn kho thấp (Bước 6) ---
    const lowStockProducts = products.filter(p => {
        // Tính tổng tồn kho của tất cả biến thể
        const totalStock = p.variants?.reduce((acc, v) => acc + (v.quantity || 0), 0) || 0;
        // Lấy định mức tối thiểu (nếu không có thì mặc định là 10)
        const minLevel = p.minStockLevel || 10;
        return totalStock <= minLevel;
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan</h2>
                <p className="text-muted-foreground text-sm">Báo cáo tình hình kinh doanh và tồn kho.</p>
            </div>

            {/* --- SECTION: LOW STOCK ALERT (MỚI) --- */}
            {lowStockProducts.length > 0 && (
                <Card className="border-l-4 border-l-red-500 bg-red-50/40 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            <CardTitle className="text-base font-bold">Cảnh báo tồn kho thấp ({lowStockProducts.length})</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {lowStockProducts.slice(0, 3).map(p => {
                                const totalStock = p.variants?.reduce((acc, v) => acc + (v.quantity || 0), 0) || 0;
                                return (
                                    <div key={p.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-md border border-red-100 shadow-sm">
                                        <span className="font-medium text-slate-700 truncate pr-2" title={p.name}>{p.name}</span>
                                        <span className="text-red-600 font-bold whitespace-nowrap bg-red-50 px-2 py-0.5 rounded text-xs">
                                            Còn: {totalStock}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {lowStockProducts.length > 3 && (
                            <div className="mt-3 flex justify-end">
                                <Link to="/products" className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1 hover:underline">
                                    Xem tất cả {lowStockProducts.length} sản phẩm cần nhập <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Tổng sản phẩm</CardTitle>
                        <Package className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics.totalProducts}</div>
                        <p className="text-xs text-muted-foreground mt-1">Mã sản phẩm trong hệ thống</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Cảnh báo tồn kho</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${metrics.lowStockCount > 0 ? 'text-red-500' : 'text-slate-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {metrics.lowStockCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Sản phẩm dưới định mức tối thiểu</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Giá trị tồn kho</CardTitle>
                        <BadgeDollarSign className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600">{metrics.totalStockValue.toLocaleString()} đ</div>
                        <p className="text-xs text-muted-foreground mt-1">Ước tính theo giá nhập</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:h-[450px]">
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-800">Top 5 Sản phẩm tồn nhiều nhất</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <RechartsTooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    formatter={(value) => [value, 'Số lượng']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="quantity" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-800">Tỷ lệ tồn kho theo Nhóm hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.stockByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {metrics.stockByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};