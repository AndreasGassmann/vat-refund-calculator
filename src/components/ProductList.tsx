import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getSavedProducts,
  deleteProduct,
  clearAllProducts,
  recalculateAllProducts,
  SavedProduct,
} from "../utils/storage";
import { formatCurrency } from "../utils/currency";
import "./ProductList.css";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const updatedProducts = await recalculateAllProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts(getSavedProducts());
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(productId);
      loadProducts();
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all products? This action cannot be undone."
      )
    ) {
      clearAllProducts();
      loadProducts();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="product-list">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="list-header">
        <h1>Saved Products</h1>
        <div className="header-actions">
          <Link to="/" className="btn btn--primary">
            Add New Product
          </Link>
          {products.length > 0 && (
            <button className="btn btn--danger" onClick={handleClearAll}>
              Clear All
            </button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No products saved yet</h2>
          <p>Add your first product to start comparing prices!</p>
          <Link to="/" className="btn btn--coral">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3 className="product-name">{product.name}</h3>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteProduct(product.id)}
                  title="Delete product"
                >
                  ×
                </button>
              </div>

              <div className="product-details">
                <div className="detail-row">
                  <span className="label">EUR Amount:</span>
                  <span className="value">
                    {formatCurrency(product.eurAmount, "EUR")}
                  </span>
                </div>

                {product.swissPrice && (
                  <div className="detail-row">
                    <span className="label">Swiss Price:</span>
                    <span className="value">
                      {formatCurrency(product.swissPrice, "CHF")}
                    </span>
                  </div>
                )}

                <div className="detail-row best-price">
                  <span className="label">Best Price:</span>
                  <span className="value">
                    {formatCurrency(product.bestPrice, "CHF")}
                  </span>
                </div>

                <div className="detail-row best-option">
                  <span className="label">Best Option:</span>
                  <span className="value">{product.bestOption}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Added:</span>
                  <span className="value">{formatDate(product.createdAt)}</span>
                </div>
              </div>

              <div className="product-actions">
                <Link
                  to={`/product/${product.id}`}
                  className="btn btn--outline-primary"
                  style={{ width: "100%" }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
