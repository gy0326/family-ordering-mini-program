export interface Dish {
  id: string;
  name: string;
  description: string;
  emoji: string;
  imageUrl?: string;
  category: DishCategory;
  tags?: string[];
}

export enum DishCategory {
  MEAT = '荤菜',
  VEGGIE = '素菜',
  SOUP = '汤羹',
  STAPLE = '主食',
  SNACK = '小吃'
}

export interface CartItem extends Dish {
  quantity: number;
}