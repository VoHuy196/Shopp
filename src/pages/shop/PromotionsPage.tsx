import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Star, Tag } from 'lucide-react';
import { ProductSelectorDialog } from '@/components/common/ProductSelectorDialog';
import type { Product } from '@/types';

const MOCK_PROMOS = [
  {
    id: 'p1',
    title: 'Giảm giá Mùa Hè - Tối đa 50%',
    subtitle: 'Áp dụng cho điện tử và phụ kiện',
    banner: '/assets/promo-summer.jpg',
    badge: '50%'
  },
  {
    id: 'p2',
    title: 'Flash Sale 24H',
    subtitle: 'Săn deal mỗi giờ - số lượng có hạn',
    banner: '/assets/promo-flash.jpg',
    badge: 'Up to 70%'
  }
];

export const PromotionsPage = () => {
  const [promos] = useState(MOCK_PROMOS);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Try to load a few featured products from local mock-data if available
    import('@/data/mock-data.json')
      .then((m) => {
        const products: Product[] = (m as any).default?.products || [];
        setFeaturedProducts(products.slice(0, 8));
      })
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white rounded-xl p-8 flex items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Khuyến mãi & Ưu đãi</h1>
          <p className="mt-2 text-slate-100/80">Tổng hợp các khuyến mãi, mã giảm giá và chương trình ưu đãi mới nhất.</p>
        </div>
        <div className="w-56">
          <img src="/assets/promo-hero.jpg" alt="Promotions" className="rounded-lg shadow-md object-cover w-full h-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.map((p) => (
          <div key={p.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="relative">
              <img src={p.banner} alt={p.title} className="w-full h-40 object-cover" />
              <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-md font-semibold">{p.badge}</div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg">{p.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{p.subtitle}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  <span>Chương trình giới hạn</span>
                </div>
                <Link to="/shop/all">
                  <Button size="sm">Xem sản phẩm</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-lg">Sản phẩm nổi bật trong chương trình</h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featuredProducts.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-8">Không có sản phẩm nổi bật</div>
          )}
          {featuredProducts.map((prod) => (
            <Link to={`/shop/product/${prod.id}`} key={prod.id} className="block bg-white rounded-lg p-3 border hover:shadow transition">
              <img src={prod.image || '/assets/product-placeholder.png'} alt={prod.name} className="w-full h-28 object-contain" />
              <div className="mt-2 text-sm font-medium text-slate-700">{prod.name}</div>
              <div className="text-xs text-slate-500">{prod.categoryId || ''}</div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};
