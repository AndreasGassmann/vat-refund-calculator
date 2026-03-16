import React, { useState, useEffect } from "react";
import {
  calculateConversion,
  createPriceComparison,
  formatCurrency,
  formatPercentageDiff,
  ConversionResult,
  ComparisonResult,
} from "../utils/currency";
import { saveProduct } from "../utils/storage";
import "./CurrencyConverter.css";

const CurrencyConverter: React.FC = () => {
  const [productName, setProductName] = useState<string>("");
  const [eurAmount, setEurAmount] = useState<string>("");
  const [swissPrice, setSwissPrice] = useState<string>("");
  const [conversionResult, setConversionResult] =
    useState<ConversionResult | null>(null);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<string>("");

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handleEurInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEurAmount(e.target.value);
  };

  const handleSwissInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSwissPrice(e.target.value);
  };

  const handleSaveProduct = () => {
    if (!productName.trim()) {
      setError("Please enter a product name");
      return;
    }

    if (!conversionResult || !comparisonResult) {
      setError("Please calculate conversion first");
      return;
    }

    try {
      const bestOption = comparisonResult.comparisons[0]; // First item is cheapest

      saveProduct({
        name: productName.trim(),
        eurAmount: conversionResult.originalAmount,
        swissPrice:
          comparisonResult.swissPrice > 0
            ? comparisonResult.swissPrice
            : undefined,
        conversionResult: {
          originalAmount: conversionResult.originalAmount,
          convertedAmount: conversionResult.convertedAmount,
          afterGermanTax: conversionResult.afterGermanTax,
          afterSwissTax: conversionResult.afterSwissTax,
          exchangeRate: conversionResult.exchangeRate,
        },
        comparisonResult: {
          swissPrice: comparisonResult.swissPrice,
          comparisons: comparisonResult.comparisons,
        },
        bestPrice: bestOption.price,
        bestOption: bestOption.option,
      });

      setSaveSuccess(`"${productName}" saved successfully!`);
      setError("");

      // Clear form
      setProductName("");
      setEurAmount("");
      setSwissPrice("");
      setConversionResult(null);
      setComparisonResult(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      setError("Error saving product. Please try again.");
      console.error("Save error:", err);
    }
  };

  const calculateConversionAndSavings = async () => {
    const eurValue = parseFloat(eurAmount);
    const swissValue = parseFloat(swissPrice);

    if (isNaN(eurValue) || eurValue <= 0) {
      setError("Please enter a valid EUR amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const conversion = await calculateConversion(eurValue);
      setConversionResult(conversion);

      const comparison = createPriceComparison(
        !isNaN(swissValue) && swissValue > 0 ? swissValue : null,
        conversion
      );
      setComparisonResult(comparison);
    } catch (err) {
      setError("Error calculating conversion. Please try again.");
      console.error("Conversion error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eurAmount && !isNaN(parseFloat(eurAmount))) {
      calculateConversionAndSavings();
    }
  }, [eurAmount]);

  useEffect(() => {
    if (conversionResult) {
      const swissValue = parseFloat(swissPrice);
      const comparison = createPriceComparison(
        !isNaN(swissValue) && swissValue > 0 ? swissValue : null,
        conversionResult
      );
      setComparisonResult(comparison);
    }
  }, [swissPrice, conversionResult]);

  return (
    <div className="currency-converter">
      <div className="converter-header">
        <h1>VAT Refund Calculator</h1>
        <p>Compare product prices with local alternatives</p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <label htmlFor="product-name">Product Name:</label>
          <input
            id="product-name"
            type="text"
            value={productName}
            onChange={handleProductNameChange}
            placeholder="Enter product name"
            className="input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="eur-amount">EUR Amount:</label>
          <input
            id="eur-amount"
            type="number"
            step="0.01"
            min="0"
            value={eurAmount}
            onChange={handleEurInputChange}
            placeholder="Enter EUR amount"
            className="input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="swiss-price">Swiss Price (CHF) - Optional:</label>
          <input
            id="swiss-price"
            type="number"
            step="0.01"
            min="0"
            value={swissPrice}
            onChange={handleSwissInputChange}
            placeholder="Enter Swiss price for comparison"
            className="input"
          />
        </div>
      </div>

      {error && <div className="message--error">{error}</div>}

      {saveSuccess && <div className="message--success">{saveSuccess}</div>}

      {loading && <div className="loading">Calculating...</div>}

      {comparisonResult && (
        <div className="add-product-section">
          <button
            className="btn btn--coral"
            onClick={handleSaveProduct}
            disabled={!productName.trim()}
          >
            Add Product to List
          </button>
        </div>
      )}

      {comparisonResult && (
        <div className="comparison-section">
          <h2>Price Comparison (Cheapest First)</h2>
          <div
            className={`data-table ${
              comparisonResult.swissPrice > 0
                ? "with-swiss-price"
                : "without-swiss-price"
            }`}
          >
            <div className="table-header">
              <div className="table-cell">Option</div>
              <div className="table-cell">Price</div>
              <div className="table-cell">
                {comparisonResult.swissPrice > 0
                  ? "vs Swiss Price"
                  : "vs Converted CHF"}
              </div>
              <div className="table-cell">Description</div>
            </div>
            {comparisonResult.comparisons.map((comparison, index) => (
              <div
                key={comparison.option}
                className={`table-row ${index === 0 ? "cheapest" : ""}`}
              >
                <div className="table-cell option-cell">
                  {comparison.option}
                  {index === 0 && (
                    <span className="best-deal">Best Deal</span>
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
      )}
    </div>
  );
};

export default CurrencyConverter;
