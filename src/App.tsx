import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CurrencyConverter from "./components/CurrencyConverter";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import About from "./components/About";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              VAT Refund Calculator
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                Calculator
              </Link>
              <Link to="/products" className="nav-link">
                Products
              </Link>
              <Link to="/about" className="nav-link">
                About
              </Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CurrencyConverter />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-container">
            <span className="footer-text">
              Built by{" "}
              <a
                href="https://andycodes.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                andycodes.dev
              </a>
            </span>
            <span className="footer-separator">·</span>
            <a
              href="https://github.com/AndreasGassmann/vat-refund-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
