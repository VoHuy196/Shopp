import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopProductList } from './ShopProductList'; // Tái sử dụng list sản phẩm

// Mock product images for carousel
const HERO_IMAGES = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1483058712412-4585f35662d1?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=400&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop'
];

export const StoreLandingPage = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 4000); // Change image every 4 seconds
        return () => clearInterval(interval);
    }, []);

    const goToPrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    };

    const goToNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    };
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Image Carousel Background */}
                <div className="absolute inset-0">
                    {HERO_IMAGES.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`Product ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                                idx === currentImageIndex ? 'opacity-40' : 'opacity-0'
                            }`}
                        />
                    ))}
                </div>

                {/* Overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20" />

                {/* Content */}
                <div className="relative z-10 p-12 md:p-24 text-center space-y-6 flex flex-col items-center justify-center min-h-[500px]">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Nâng tầm phong cách <br/> cùng <span className="text-indigo-400">MyStore</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Khám phá bộ sưu tập thời trang và công nghệ mới nhất. Chất lượng đỉnh cao, giá cả hợp lý.
                    </p>
                    <div>
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-lg px-8 h-12 rounded-full">
                            Mua sắm ngay <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Carousel Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                    <button onClick={goToPrevImage} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex gap-2">
                        {HERO_IMAGES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-2 rounded-full transition-all ${
                                    idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 w-2'
                                }`}
                            />
                        ))}
                    </div>
                    <button onClick={goToNextImage} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </section>

            {/* Featured Products */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="h-6 w-6 text-amber-400 fill-amber-400" /> 
                        Sản phẩm nổi bật
                    </h2>
                    <Link to="/shop/all" className="text-indigo-600 hover:underline">Xem tất cả</Link>
                </div>
                {/* Gọi lại component list sản phẩm nhưng có thể limit số lượng nếu muốn */}
                <ShopProductList />
            </section>
        </div>
    );
};