import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  doc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Combo {
  label: string;
  quantity: number;
  discount: number;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  combos?: Combo[];
}

const PRODUCTS_COLLECTION = 'products';

// Lấy tất cả sản phẩm
export const getProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure combos is always an array
        combos: Array.isArray(data.combos) ? data.combos : []
      };
    }) as Product[];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

// Thêm sản phẩm mới
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    // Ensure combos is saved as a clean array
    const cleanProduct = {
        ...product,
        combos: product.combos || []
    };
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), cleanProduct);
    return { id: docRef.id, ...cleanProduct };
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Không thể thêm sản phẩm');
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (id: string, product: Omit<Product, 'id'>): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, product);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Không thể cập nhật sản phẩm');
  }
};

// Xóa sản phẩm
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Không thể xóa sản phẩm');
  }
};
