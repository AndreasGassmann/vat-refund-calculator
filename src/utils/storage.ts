// localStorage utilities for saving products

import {
  convertEurToChf,
  deductGermanTax,
  addSwissTax,
  createPriceComparison,
  fetchExchangeRate,
} from "./currency";

export interface SavedProduct {
  id: string;
  name: string;
  eurAmount: number;
  swissPrice?: number;
  conversionResult: {
    originalAmount: number;
    convertedAmount: number;
    afterGermanTax: number;
    afterSwissTax: number;
    exchangeRate: number;
  };
  comparisonResult: {
    swissPrice: number;
    comparisons: Array<{
      option: string;
      price: number;
      description: string;
      percentageDiff: number;
    }>;
  };
  bestPrice: number;
  bestOption: string;
  createdAt: string;
}

const STORAGE_KEY = "currency-calculator-products";

/**
 * Save a product to localStorage
 */
export function saveProduct(
  product: Omit<SavedProduct, "id" | "createdAt">
): SavedProduct {
  const savedProduct: SavedProduct = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const existingProducts = getSavedProducts();
  existingProducts.push(savedProduct);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingProducts));
  return savedProduct;
}

/**
 * Get all saved products from localStorage
 */
export function getSavedProducts(): SavedProduct[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading products from localStorage:", error);
    return [];
  }
}

/**
 * Delete a product from localStorage
 */
export function deleteProduct(productId: string): void {
  const products = getSavedProducts();
  const filteredProducts = products.filter((p) => p.id !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProducts));
}

/**
 * Clear all saved products
 */
export function clearAllProducts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Recalculate all saved products with the latest exchange rate
 */
export async function recalculateAllProducts(): Promise<SavedProduct[]> {
  const exchangeRate = await fetchExchangeRate();
  const products = getSavedProducts();

  const updated = products.map((product) => {
    const convertedAmount = convertEurToChf(product.eurAmount, exchangeRate);
    const afterGermanTax = deductGermanTax(convertedAmount);
    const afterSwissTax = addSwissTax(afterGermanTax);

    const conversionResult = {
      originalAmount: product.eurAmount,
      convertedAmount,
      afterGermanTax,
      afterSwissTax,
      exchangeRate,
    };

    const comparison = createPriceComparison(
      product.swissPrice && product.swissPrice > 0
        ? product.swissPrice
        : null,
      { ...conversionResult, afterSwissRefund: 0 }
    );

    const bestOption = comparison.comparisons[0];

    return {
      ...product,
      conversionResult,
      comparisonResult: comparison,
      bestPrice: bestOption.price,
      bestOption: bestOption.option,
    };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
