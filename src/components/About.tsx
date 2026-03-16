import React from "react";
import "./About.css";

const About: React.FC = () => {
  return (
    <div className="about">
      <div className="about-content">
        <h1>About VAT Refund Calculator</h1>

        <div className="about-section">
          <h2>What This Tool Does</h2>
          <p>
            This calculator helps you understand the true cost of purchasing
            items when converting between EUR and CHF currencies, taking into
            account different tax structures in Germany and Switzerland.
          </p>
        </div>

        <div className="about-section">
          <h2>How It Works</h2>
          <ol>
            <li>
              <strong>Currency Conversion:</strong> Converts your EUR amount to
              CHF using current exchange rates
            </li>
            <li>
              <strong>German Tax Deduction:</strong> Removes German VAT (19%)
              from the converted amount, as German prices typically include VAT
            </li>
            <li>
              <strong>Swiss Tax Addition:</strong> Adds Swiss VAT (8.1%) to get
              the final Swiss price
            </li>
            <li>
              <strong>Savings Comparison:</strong> If you enter a Swiss price,
              it calculates percentage savings compared to each step
            </li>
          </ol>
        </div>

        <div className="about-section">
          <h2>Tax Rates Used</h2>
          <ul>
            <li>
              <strong>German VAT:</strong> 19% (deducted from price)
            </li>
            <li>
              <strong>Swiss VAT:</strong> 8.1% (added to net amount)
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Exchange Rate</h2>
          <p>
            Exchange rates are fetched from{" "}
            <a href="https://api.exchangerate-api.com" target="_blank" rel="noopener noreferrer">
              api.exchangerate-api.com
            </a>
            . All saved products are automatically recalculated with the latest
            rate when viewed.
          </p>
        </div>

        <div className="about-section">
          <h2>Disclaimer</h2>
          <p>
            This tool is for informational purposes only. Tax rates and exchange
            rates may vary. Always consult with financial professionals for
            important financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
