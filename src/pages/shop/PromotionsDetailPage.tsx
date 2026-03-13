import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import type { Product } from '@/types';

const MOCK_PROMOS: Record<string, any> = {
  p1: {
    id: 'p1',
    title: 'Giảm giá Mùa Hè - Tối đa 50%',
    description: 'Ưu đãi lớn cho các sản phẩm điện tử, phụ kiện và nhiều hơn nữa. Giảm lên đến 50% cho sản phẩm chọn lọc trong suốt mùa hè.',
    banner: '/assets/promo-summer.jpg'
  },
  p2: {
    id: 'p2',
    title: 'Flash Sale 24H',
    description: 'Chương trình flash sale diễn ra trong 24 giờ với các mức giảm tới 70% trên một số mặt hàng. Số lượng có hạn, nhanh tay lên!',
    banner: '/assets/promo-flash.jpg'
  }
};

export const PromotionsDetailPage = () => {
  const { id } = useParams();
  const [promo, setPromo] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // load promo data
    if (id && MOCK_PROMOS[id]) setPromo(MOCK_PROMOS[id]);
    else setPromo(null);

    // load some example products
    import('@/data/mock-data.json')
      .then((m) => {
        const prods: Product[] = (m as any).default?.products || [];
        setProducts(prods.slice(0, 8));
      })
      .catch(() => setProducts([]));
  }, [id]);

  if (!promo) {
    return (
      <div className="p-8 text-center text-slate-500">Chương trình khuyến mãi không tồn tại.</div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border rounded-xl overflow-hidden">
        <img src={promo.banner} alt={promo.title} className="w-full h-56 object-cover" />
        <div className="p-6">
          <h1 className="text-2xl font-bold">{promo.title}</h1>
          <p className="mt-3 text-slate-600">{promo.description}</p>
          <div className="mt-6 flex gap-3">
            <Link to="/shop/all">
              <Button variant="outline">Xem tất cả sản phẩm</Button>
            </Link>
            <Link to="/shop/cart">
              <Button>Giỏ hàng</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-lg">Sản phẩm áp dụng</h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-8">Không có sản phẩm</div>
          )}
          {products.map((prod) => (
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
