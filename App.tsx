import React, { useState, useEffect, useMemo } from 'react';
import { Dish, DishCategory } from './types';
import { DishCard } from './components/DishCard';
import { AddDishModal } from './components/AddDishModal';
import { PlusIcon, HomeIcon, ChefHatIcon, PaperAirplaneIcon } from './components/Icons';
import { Toast } from './components/Toast';

// Initial Mock Data
const INITIAL_DISHES: Dish[] = [
  { id: '1', name: '红烧肉', category: DishCategory.MEAT, description: '肥而不腻，入口即化，家的味道！', emoji: '🥓' },
  { id: '2', name: '清炒时蔬', category: DishCategory.VEGGIE, description: '清脆爽口，健康解腻。', emoji: '🥬' },
  { id: '3', name: '番茄蛋汤', category: DishCategory.SOUP, description: '酸酸甜甜，开胃又暖胃。', emoji: '🍅' },
  { id: '4', name: '可乐鸡翅', category: DishCategory.MEAT, description: '小朋友的最爱，甜咸适中。', emoji: '🍗' },
];

export default function App() {
  const [dishes, setDishes] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('family-nomnom-dishes');
    return saved ? JSON.parse(saved) : INITIAL_DISHES;
  });
  
  const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOrderSheet, setShowOrderSheet] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('family-nomnom-dishes', JSON.stringify(dishes));
  }, [dishes]);

  const handleAddDish = (name: string, category: DishCategory, description: string, emoji: string, imageUrl?: string) => {
    const newDish: Dish = {
      id: Date.now().toString(),
      name,
      category,
      description,
      emoji,
      imageUrl // Store the image data (base64)
    };
    setDishes(prev => [newDish, ...prev]);
  };

  const handleDeleteDish = (id: string) => {
    setDishes(prev => prev.filter(d => d.id !== id));
    setSelectedDishes(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleSelection = (dish: Dish) => {
    setSelectedDishes(prev => {
      const next = new Set(prev);
      if (next.has(dish.id)) {
        next.delete(dish.id);
      } else {
        next.add(dish.id);
      }
      return next;
    });
  };

  const handleNotifyChef = async () => {
    if (selectedDishes.size === 0) return;

    const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    const selectedItems = dishes.filter(d => selectedDishes.has(d.id));
    
    // Generate Menu Text
    let menuText = `📅 ${today} 菜单来了！\n`;
    menuText += `------------------\n`;
    selectedItems.forEach((dish, index) => {
      menuText += `${index + 1}. ${dish.name} ${dish.emoji}\n`;
    });
    menuText += `------------------\n`;
    menuText += `共 ${selectedItems.length} 道菜，辛苦大厨啦！👨‍🍳❤️`;

    // Copy to Clipboard
    try {
      await navigator.clipboard.writeText(menuText);
      setToastMessage('菜单已复制！正在前往微信... 🚀');
      setShowToast(true);
      setShowOrderSheet(false);
      
      // Delay slightly to let the user see the toast, then try to open WeChat
      setTimeout(() => {
        window.location.href = "weixin://";
      }, 1500);

    } catch (err) {
      setToastMessage('复制失败，请截图发送～');
      setShowToast(true);
    }
  };

  const categories = ['全部', ...Object.values(DishCategory)];

  const filteredDishes = useMemo(() => {
    if (activeCategory === '全部') return dishes;
    return dishes.filter(d => d.category === activeCategory);
  }, [dishes, activeCategory]);

  const todayMenu = dishes.filter(d => selectedDishes.has(d.id));

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-dark font-sans flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-gray-100">
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 pt-12 pb-4 border-b border-orange-50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-dark">家味小厨 🥢</h1>
            <p className="text-sm text-gray-400 font-medium">今天吃点什么好呢？</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
             <span className="text-xl">👩‍🍳</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 snap-x">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all snap-start
                ${activeCategory === cat 
                  ? 'bg-dark text-white shadow-md' 
                  : 'bg-white text-gray-400 border border-gray-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-32 space-y-4 overflow-y-auto no-scrollbar">
        {filteredDishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="text-6xl mb-4">🥡</div>
            <p>这个分类下还没菜呢</p>
          </div>
        ) : (
          filteredDishes.map(dish => (
            <DishCard
              key={dish.id}
              dish={dish}
              isSelected={selectedDishes.has(dish.id)}
              onToggleSelect={toggleSelection}
              onDelete={handleDeleteDish}
            />
          ))
        )}
      </main>

      {/* Floating Action Button (Add) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-dark text-white rounded-full shadow-lg shadow-gray-400/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-90 z-20"
        aria-label="Add Dish"
      >
        <PlusIcon />
      </button>

      {/* Bottom Cart / Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none max-w-md mx-auto z-30">
        <div className="pointer-events-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 flex items-center justify-between border border-gray-100 relative">
          
          {/* Cart Summary */}
          <div 
            className="flex items-center gap-3 pl-2 flex-1 cursor-pointer"
            onClick={() => selectedDishes.size > 0 && setShowOrderSheet(!showOrderSheet)}
          >
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedDishes.size > 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-300'}`}>
              <ChefHatIcon className="w-6 h-6" />
              {selectedDishes.size > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {selectedDishes.size}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">今日菜单</p>
              <p className="font-bold text-dark text-sm">
                {selectedDishes.size === 0 ? "点选菜品加入" : `已选 ${selectedDishes.size} 道菜`}
              </p>
            </div>
          </div>

          {/* Confirm Button / Notify Chef */}
          <button 
            disabled={selectedDishes.size === 0}
            onClick={handleNotifyChef}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2
              ${selectedDishes.size > 0 
                ? 'bg-[#07C160] text-white shadow-lg shadow-green-200 hover:brightness-105 active:scale-95' 
                : 'bg-gray-100 text-gray-300'}`}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            <span>通知大厨</span>
          </button>
        </div>
      </div>

      {/* Order Summary Sheet (Popup) */}
      {showOrderSheet && selectedDishes.size > 0 && (
        <>
          <div className="fixed inset-0 bg-black/20 z-20 backdrop-blur-[2px]" onClick={() => setShowOrderSheet(false)} />
          <div className="fixed bottom-24 left-4 right-4 bg-white rounded-3xl shadow-xl z-30 p-4 max-w-[calc(100%-2rem)] mx-auto animate-in slide-in-from-bottom-10 md:max-w-md">
            <h3 className="font-bold text-lg mb-4 px-2">今日菜单 📜</h3>
            <div className="max-h-[40vh] overflow-y-auto space-y-2">
              {todayMenu.map(dish => (
                <div key={dish.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {/* Show small image preview if exists, else emoji */}
                    {dish.imageUrl ? (
                       <img src={dish.imageUrl} alt={dish.name} className="w-8 h-8 rounded-full object-cover border border-orange-200" />
                    ) : (
                       <span className="text-2xl">{dish.emoji}</span>
                    )}
                    <span className="font-bold text-sm">{dish.name}</span>
                  </div>
                  <button 
                    onClick={() => toggleSelection(dish)}
                    className="text-gray-400 hover:text-red-500 px-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-3">
               <button 
                onClick={() => { setSelectedDishes(new Set()); setShowOrderSheet(false); }}
                className="text-xs text-red-400 font-bold px-3 py-2 bg-red-50 rounded-lg"
              >
                清空
              </button>
              <button 
                onClick={handleNotifyChef}
                className="flex-1 text-sm bg-[#07C160] text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2"
              >
                 <PaperAirplaneIcon className="w-4 h-4" />
                 立即发送给大厨
              </button>
            </div>
          </div>
        </>
      )}

      <AddDishModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDish}
      />
    </div>
  );
}