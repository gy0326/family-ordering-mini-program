import React from 'react';
import { Dish } from '../types';
import { TrashIcon, CheckIcon } from './Icons';

interface DishCardProps {
    dish: Dish;
    isSelected: boolean;
    onToggleSelect: (dish: Dish) => void;
    onDelete: (id: string) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, isSelected, onToggleSelect, onDelete }) => {
    return (
        <div
            className={`relative group bg-white p-3 rounded-3xl shadow-sm border-2 transition-all duration-200 active:scale-95 touch-manipulation cursor-pointer select-none overflow-hidden
        ${isSelected ? 'border-primary bg-orange-50 ring-2 ring-primary ring-opacity-20' : 'border-transparent hover:border-orange-100'}
      `}
            onClick={() => onToggleSelect(dish)}
        >
            <div className="flex items-start gap-4 h-24">
                {/* Image or Emoji Icon */}
                <div className="w-24 h-24 rounded-2xl bg-brand-100 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative">
                    {dish.imageUrl ? (
                        <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <span className="text-5xl select-none">{dish.emoji}</span>
                    )}

                    {/* Category Tag overlaid if image exists */}
                    {dish.imageUrl && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 pt-4">
                            <span className="text-[10px] text-white font-bold px-1.5 drop-shadow-md">{dish.emoji} {dish.category}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col h-full py-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-dark text-lg leading-tight truncate pr-2">{dish.name}</h3>
                        {isSelected && (
                            <div className="bg-primary text-white rounded-full p-1 shadow-sm transition-all duration-200 shrink-0">
                                <CheckIcon className="w-3 h-3" />
                            </div>
                        )}
                    </div>

                    {!dish.imageUrl && <p className="text-xs text-brand-400 font-medium mt-1 mb-1">{dish.category}</p>}
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed text-xs">{dish.description}</p>
                </div>
            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`确定要删除 "${dish.name}" 吗?`)) {
                        onDelete(dish.id);
                    }
                }}
                className="absolute bottom-2 right-2 p-2 text-gray-300 hover:text-red-400 active:text-red-500 transition-colors z-10"
                aria-label="Delete dish"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};