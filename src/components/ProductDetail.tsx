import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getSavedProducts, recalculateAllProducts, SavedProduct } from "../utils/storage";
import { formatCurrency, formatPercentageDiff } from "../utils/currency";
import "./ProductDetail.css";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<SavedProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const products = await recalculateAllProducts();
      const foundProduct = products.find((p) => p.id === id);

      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      const fallback = getSavedProducts().find((p) => p.id === id);
      if (fallback) {
        setProduct(fallback);
      } else {
        setError("Product not found");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="error-state">
          <h2>Product Not Found</h2>
          <p>
            The product you're looking for doesn't exist or has been deleted.
          </p>
          <Link to="/products" className="back-to-list-btn">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="detail-header">
        <Link to="/products" className="back-btn">
          ← Back to Products
        </Link>
        <h1>{product.name}</h1>
        <div className="product-meta">
          <span className="created-date">
            Added on {formatDate(product.createdAt)}
          </span>
        </div>
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h2>Product Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">EUR Amount:</span>
              <span className="value">
                {formatCurrency(product.eurAmount, "EUR")}
              </span>
            </div>

            {product.swissPrice && (
              <div className="info-item">
                <span className="label">Swiss Price:</span>
                <span className="value">
                  {formatCurrency(product.swissPrice, "CHF")}
                </span>
              </div>
            )}

            <div className="info-item">
              <span className="label">Exchange Rate:</span>
              <span className="value">
                1 EUR = {product.conversionResult.exchangeRate.toFixed(4)} CHF
              </span>
            </div>
          </div>
        </div>

        <div className="comparison-section">
          <h2>Price Comparison</h2>
          <div className="comparison-table">
            <div className="table-header">
              <div className="table-cell">Option</div>
              <div className="table-cell">Price</div>
              <div className="table-cell">
                {(product.swissPrice ?? 0) > 0 ? "vs Swiss Price" : "vs Converted CHF"}
              </div>
              <div className="table-cell">Description</div>
            </div>

            {product.comparisonResult.comparisons.map((comparison, index) => (
              <div
                key={comparison.option}
                className={`table-row ${index === 0 ? "cheapest" : ""}`}
              >
                <div className="table-cell option-cell">
                  {comparison.option}
                  {index === 0 && (
                    <span className="best-deal">🏆 Best Deal</span>
                  )}
                </div>
                <div className="table-cell price-cell">
                  {formatCurrency(comparison.price, "CHF")}
                </div>
                <div
                  className={`table-cell percentage-cell ${
                    comparison.percentageDiff < 0
                      ? "savings"
                      : comparison.percentageDiff > 0
                      ? "more-expensive"
                      : "reference"
                  }`}
                >
                  {formatPercentageDiff(comparison.percentageDiff)}
                </div>
                <div className="table-cell description-cell">
                  {comparison.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h2>Summary</h2>
          <div className="summary-card">
            <div className="summary-item best-price">
              <span className="label">Best Price:</span>
              <span className="value">
                {formatCurrency(product.bestPrice, "CHF")}
              </span>
            </div>
            <div className="summary-item best-option">
              <span className="label">Best Option:</span>
              <span className="value">{product.bestOption}</span>
            </div>
            <div className="summary-item savings">
              <span className="label">Total Savings:</span>
              <span className="value">
                {(product.swissPrice ?? 0) > 0
                  ? formatCurrency(
                      (product.swissPrice ?? 0) - product.bestPrice,
                      "CHF"
                    )
                  : formatCurrency(
                      product.eurAmount - product.bestPrice,
                      "CHF"
                    )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
