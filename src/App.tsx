import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Stores (Zustand - no Provider needed) ---


// --- Layouts ---
import { MainLayout } from './components/layouts/MainLayout';
import { ShopLayout } from './components/layouts/ShopLayout';

// --- Auth & Security ---
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// --- Shop Pages (Public) ---
import { StoreLandingPage } from './pages/shop/StoreLandingPage';
import { ShopProductList } from './pages/shop/ShopProductList';
import { CartPage } from './pages/shop/CartPage';
import { PromotionsPage } from './pages/shop/PromotionsPage';
import { PromotionsDetailPage } from './pages/shop/PromotionsDetailPage';

// --- Admin Pages (Protected) ---
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProductList } from './pages/products/ProductList';
import { ProductForm } from './pages/products/ProductForm';
import { SupplierList } from './pages/suppliers/SupplierList';
import { SupplierForm } from './pages/suppliers/SupplierForm';
import { InboundList } from './pages/inbound/InboundList';
import { InboundForm } from './pages/inbound/InboundForm';
import { InboundDetailPage } from './pages/inbound/InboundDetailPage';
import { OutboundList } from './pages/outbound/OutboundList';
import { WholesaleForm } from './pages/outbound/WholesaleForm';
import { OutboundDetailPage } from './pages/outbound/OutboundDetailPage';
import { RetailPOS } from './pages/outbound/RetailPOS';
import { CategoryList } from './pages/categories/CategoryList';
import { CategoryForm } from './pages/categories/CategoryForm';
import { UnitGroupList } from './pages/unit-groups/UnitGroupList';
import { StockAdjustmentList } from './pages/inventory/StockAdjustmentList';
import { StockTakeForm } from './pages/inventory/StockTakeForm';
import { StockTransferForm } from './pages/inventory/StockTransferForm';
import { ProjectDashboard } from './pages/projects/ProjectDashboard';
import { TaskBoard } from './pages/projects/TaskBoard';
import { MembersPage } from './pages/projects/MembersPage';
import { TaskAssignmentsPage } from './pages/projects/TaskAssignmentsPage';
import { AttributeList } from './pages/attributes/AttributeList';
import { UserManagementPage } from './pages/user-management/UserManagementPage';

function App() {
  return (
    <BrowserRouter>

          <Routes>
            
            {/* --- KHU VỰC CỬA HÀNG (PUBLIC) --- */}
            {/* Ai cũng có thể truy cập, không cần đăng nhập */}
            <Route path="/" element={<ShopLayout />}>
              <Route index element={<StoreLandingPage />} />
              <Route path="shop/all" element={<ShopProductList />} />
              <Route path="shop/promotions" element={<PromotionsPage />} />
              <Route path="shop/promotions/:id" element={<PromotionsDetailPage />} />
              <Route path="shop/cart" element={<CartPage />} />
              {/* <Route path="shop/cart" element={<CartPage />} /> */}
            </Route>

            {/* --- TRANG ĐĂNG NHẬP / ĐĂNG KÝ --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- KHU VỰC QUẢN TRỊ (PROTECTED) --- */}
            {/* Chỉ truy cập được khi đã Login, nếu chưa sẽ bị đẩy về /login */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Quản lý Sản phẩm */}
                <Route path="products" element={<ProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="categories" element={<CategoryList />} />
                <Route path="categories/new" element={<CategoryForm />} />
                <Route path="attributes" element={<AttributeList />} />
                <Route path="units" element={<UnitGroupList />} />

                {/* Quản lý Đối tác */}
                <Route path="suppliers" element={<SupplierList />} />
                <Route path="suppliers/new" element={<SupplierForm />} />

                {/* Nhập kho */}
                <Route path="inbound" element={<InboundList />} />
                <Route path="inbound/new" element={<InboundForm />} />
                <Route path="inbound/:id" element={<InboundDetailPage />} />
                <Route path="inbound/:id/edit" element={<InboundForm />} />

                {/* Xuất kho & Bán hàng */}
                <Route path="outbound" element={<OutboundList />} />
                <Route path="outbound/wholesale" element={<WholesaleForm />} />
                <Route path="outbound/:id" element={<OutboundDetailPage />} />
                <Route path="outbound/:id/edit" element={<WholesaleForm />} />
                <Route path="outbound/retail" element={<RetailPOS />} />

                {/* Quản lý Kho */}
                <Route path="inventory" element={<StockAdjustmentList />} />
                <Route path="inventory/new" element={<StockTakeForm />} />
                <Route path="inventory/transfer" element={<StockTransferForm />} />

                {/* Quản lý Dự án */}
                <Route path="projects" element={<ProjectDashboard />} />
                <Route path="projects/:id/tasks" element={<TaskBoard />} />
                <Route path="projects/members" element={<MembersPage />} />
                <Route path="projects/assignments" element={<TaskAssignmentsPage />} />

                {/* Quản lý Tài khoản */}
                <Route path="users" element={<UserManagementPage />} />
              </Route>
            </Route>

            {/* Catch All: Chuyển hướng về trang chủ nếu gõ sai đường dẫn */}
            <Route path="*" element={<Navigate to="/" replace />} />
            
          </Routes>
        </BrowserRouter>
  );
}

export default App;
