export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  budgetLimit: number;
}

export interface Category {
  id: string;
  name: string;
  budgetLimit: number;
  subcategories: Subcategory[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  subcategory?: {
    name: string;
    category?: {
      name: string;
    };
  };
}
