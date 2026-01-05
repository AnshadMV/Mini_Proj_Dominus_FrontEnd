
export interface Product {
    id: number;
    name: string;
    price: number;
    images: string[];
    // isStock: boolean;
    colors: string[];
    // currentStock: number;
    category: string;
    slug: string;

    description: string;
    warranty: string;
    isActive: boolean;
    inStock: boolean;
    topSelling: boolean;
    categoryId: number;
    categoryName: string;
    availableColors: {
        colorId: number;
        colorName: string;
        hexCode?: string;
    }[];
    currentStock: number;
}