import React, { useState, useRef } from 'react';
import { DishCategory } from '../types';
import { generateDishDetails } from '../services/geminiService';
import { SparklesIcon, ChevronDownIcon } from './Icons';

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, category: DishCategory, desc: string, emoji: string, imageUrl?: string) => void;
}

const EMOJI_PRESETS = ['🥘', '🍚', '🍜', '🥩', '🥓', '🍗', '🥚', '🥬', '🥦', '🌽', '🥟', '🍤', '🍲', '🍱', '🍔'];

export const AddDishModal: React.FC<AddDishModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DishCategory>(DishCategory.MEAT);
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🥘');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSmartFill = async () => {
    if (!name.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateDishDetails(name);
      if (result) {
        setDescription(result.description);
        setEmoji(result.emoji);
        setCategory(result.category as DishCategory);
      }
    } catch (e) {
      alert('AI 好像开小差了，请检查 API Key 或稍后再试～');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("图片太大了，请上传小于 2MB 的图片哦");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name, category, description || '暂无描述', emoji, imagePreview || undefined);
      // Reset
      setName('');
      setDescription('');
      setEmoji('🥘');
      setIsEmojiOpen(false);
      setImagePreview(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white w-full sm:w-[450px] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl pointer-events-auto transform transition-transform duration-300 ease-out animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
        
        <h2 className="text-xl font-bold text-dark mb-6 text-center">添加新菜品 🍳</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div className="flex justify-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group
                ${imagePreview ? 'border-primary bg-gray-50' : 'border-gray-300 bg-gray-50 hover:bg-orange-50 hover:border-primary'}
              `}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm">更换图片</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-gray-400 group-hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  </div>
                  <span className="text-gray-400 text-sm font-medium">点击添加图片 (可选)</span>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">菜名</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: 红烧肉"
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleSmartFill}
                disabled={isGenerating || !name.trim()}
                className={`px-3 py-2 rounded-xl flex items-center gap-1 text-sm font-bold transition-all shadow-sm shrink-0
                  ${isGenerating || !name.trim() 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:shadow-md active:scale-95'}
                `}
              >
                {isGenerating ? (
                  <span className="animate-spin">✨</span>
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">AI 帮我想</span>
                <span className="sm:hidden">AI</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-20">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DishCategory)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none"
              >
                {Object.values(DishCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Custom Emoji Input with Dropdown */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">图标</label>
              <div className="relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="flex-1 bg-gray-50 border border-r-0 border-gray-200 text-gray-900 text-sm rounded-l-xl focus:ring-primary focus:border-primary block p-3 outline-none text-center"
                    maxLength={2}
                    placeholder="输入"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                    className="bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl px-3 py-3 hover:bg-gray-200 transition-colors"
                  >
                     <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isEmojiOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isEmojiOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 animate-in slide-in-from-top-2 fade-in duration-200">
                    <p className="text-xs text-gray-400 font-bold mb-2 ml-1">常用图标</p>
                    <div className="grid grid-cols-5 gap-2">
                      {EMOJI_PRESETS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => { setEmoji(e); setIsEmojiOpen(false); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-orange-50 hover:scale-110 transition-all text-xl"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">描述 (选填)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="这道菜的味道怎么样..."
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 px-5 text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3.5 px-5 text-sm font-bold text-white bg-primary rounded-2xl shadow-lg shadow-orange-200 hover:bg-brand-500 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              添加上桌
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};