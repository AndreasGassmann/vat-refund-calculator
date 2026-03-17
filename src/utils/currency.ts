// Utility functions for currency conversion and tax calculations

export interface CurrencyRates {
  EUR: number;
  CHF: number;
}

export interface TaxRates {
  german: number; // German VAT rate (19%)
  swiss: number; // Swiss VAT rate (8.1%)
}

export interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  afterGermanTax: number;
  afterSwissTax: number;
  afterSwissRefund: number;
  exchangeRate: number;
}

export interface CalculationStep {
  label: string;
  formula: string;
  result: string;
}

export interface PriceComparison {
  option: string;
  price: number;
  description: string;
  percentageDiff: number;
  calculationSteps: CalculationStep[];
}

export interface ComparisonResult {
  swissPrice: number;
  comparisons: PriceComparison[];
}

// Tax rates (as percentages)
export const TAX_RATES: TaxRates = {
  german: 19, // German VAT
  swiss: 8.1, // Swiss VAT
};

// Swiss refund rate (as percentage)
export const SWISS_REFUND_RATE = 4.5; // 4.5% refund when buying in Switzerland

/**
 * Fetches current EUR to CHF exchange rate
 * Using a free API (in production, you'd want a more reliable service)
 */
export async function fetchExchangeRate(): Promise<number> {
  try {
    // Using exchangerate-api.com (free tier)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/EUR"
    );
    const data = await response.json();
    return data.rates.CHF;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    // Fallback rate if API fails
    return 0.93; // Approximate EUR to CHF rate
  }
}

/**
 * Converts EUR to CHF
 */
export function convertEurToChf(
  eurAmount: number,
  exchangeRate: number
): number {
  return eurAmount * exchangeRate;
}

/**
 * Calculates amount after deducting German tax (VAT)
 * Correctly removes 19% VAT from a price that includes VAT
 * Formula: Net amount = Sale price / (1 + VAT %)
 */
export function deductGermanTax(amount: number): number {
  return amount / (1 + TAX_RATES.german / 100);
}

/**
 * Calculates amount after adding Swiss tax (VAT)
 * Swiss VAT is added to the net amount
 */
export function addSwissTax(amount: number): number {
  return amount * (1 + TAX_RATES.swiss / 100);
}

/**
 * Calculates amount after Swiss refund
 * Deducts 4.5% refund from the Swiss price
 */
export function applySwissRefund(amount: number): number {
  return amount * (1 - SWISS_REFUND_RATE / 100);
}

/**
 * Performs complete conversion and tax calculation
 */
export async function calculateConversion(
  eurAmount: number
): Promise<ConversionResult> {
  const exchangeRate = await fetchExchangeRate();
  const convertedAmount = convertEurToChf(eurAmount, exchangeRate);
  const afterGermanTax = deductGermanTax(convertedAmount);
  const afterSwissTax = addSwissTax(afterGermanTax);

  return {
    originalAmount: eurAmount,
    convertedAmount,
    afterGermanTax,
    afterSwissTax,
    afterSwissRefund: 0, // Will be calculated separately when Swiss price is provided
    exchangeRate,
  };
}

/**
 * Formats currency amount for display
 */
export function formatCurrency(
  amount: number,
  currency: "EUR" | "CHF"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Creates a price comparison table ordered by cost (cheapest first)
 */
export function createPriceComparison(
  swissPrice: number | null,
  conversionResult: ConversionResult
): ComparisonResult {
  const comparisons: PriceComparison[] = [];
  const fmt = (n: number) => n.toFixed(2);
  const rate = conversionResult.exchangeRate;
  const eurAmount = conversionResult.originalAmount;

  // Add Swiss options only if Swiss price is provided
  if (swissPrice !== null && swissPrice > 0) {
    const swissPriceWithRefund = applySwissRefund(swissPrice);
    const refundAmount = swissPrice * (SWISS_REFUND_RATE / 100);

    comparisons.push(
      {
        option: "🇨🇭 Swiss Price (Your Input)",
        price: swissPrice,
        description: "Direct purchase in Switzerland",
        percentageDiff: 0, // Reference point
        calculationSteps: [
          { label: "Swiss retail price", formula: `CHF ${fmt(swissPrice)}`, result: `CHF ${fmt(swissPrice)}` },
        ],
      },
      {
        option: "🇨🇭 Swiss Price with Refund",
        price: swissPriceWithRefund,
        description: "Swiss price with 4.5% refund applied",
        percentageDiff:
          ((swissPriceWithRefund - swissPrice) / swissPrice) * 100,
        calculationSteps: [
          { label: "Swiss retail price", formula: `CHF ${fmt(swissPrice)}`, result: `CHF ${fmt(swissPrice)}` },
          { label: `Refund (${SWISS_REFUND_RATE}%)`, formula: `${fmt(swissPrice)} × ${SWISS_REFUND_RATE}%`, result: `− CHF ${fmt(refundAmount)}` },
          { label: "Final price", formula: `${fmt(swissPrice)} − ${fmt(refundAmount)}`, result: `CHF ${fmt(swissPriceWithRefund)}` },
        ],
      }
    );
  }

  // Determine reference point for percentage calculations
  const referencePrice = swissPrice || conversionResult.convertedAmount;

  // Pre-calculate intermediate values for German options
  const chfConverted = conversionResult.convertedAmount;
  const germanTaxAmount = chfConverted - conversionResult.afterGermanTax;
  const swissTaxAmount = conversionResult.afterSwissTax - conversionResult.afterGermanTax;

  // Always add German options
  comparisons.push(
    {
      option: "🇩🇪 After German Tax Refund + Swiss Tax",
      price: conversionResult.afterSwissTax,
      description: "EUR converted + German tax removed + Swiss tax added",
      percentageDiff:
        ((conversionResult.afterSwissTax - referencePrice) / referencePrice) *
        100,
      calculationSteps: [
        { label: "Original price", formula: `€${fmt(eurAmount)}`, result: `€${fmt(eurAmount)}` },
        { label: "Convert to CHF", formula: `${fmt(eurAmount)} × ${rate.toFixed(4)}`, result: `CHF ${fmt(chfConverted)}` },
        { label: `Remove German VAT (${TAX_RATES.german}%)`, formula: `${fmt(chfConverted)} ÷ 1.${TAX_RATES.german}`, result: `− CHF ${fmt(germanTaxAmount)}` },
        { label: "Net price", formula: "", result: `CHF ${fmt(conversionResult.afterGermanTax)}` },
        { label: `Add Swiss VAT (${TAX_RATES.swiss}%)`, formula: `${fmt(conversionResult.afterGermanTax)} × ${TAX_RATES.swiss}%`, result: `+ CHF ${fmt(swissTaxAmount)}` },
        { label: "Final price", formula: `${fmt(conversionResult.afterGermanTax)} + ${fmt(swissTaxAmount)}`, result: `CHF ${fmt(conversionResult.afterSwissTax)}` },
      ],
    },
    {
      option: "🇩🇪 After German Tax Refund",
      price: conversionResult.afterGermanTax,
      description: "EUR converted + German tax removed",
      percentageDiff:
        ((conversionResult.afterGermanTax - referencePrice) / referencePrice) *
        100,
      calculationSteps: [
        { label: "Original price", formula: `€${fmt(eurAmount)}`, result: `€${fmt(eurAmount)}` },
        { label: "Convert to CHF", formula: `${fmt(eurAmount)} × ${rate.toFixed(4)}`, result: `CHF ${fmt(chfConverted)}` },
        { label: `Remove German VAT (${TAX_RATES.german}%)`, formula: `${fmt(chfConverted)} ÷ 1.${TAX_RATES.german}`, result: `− CHF ${fmt(germanTaxAmount)}` },
        { label: "Final price", formula: "", result: `CHF ${fmt(conversionResult.afterGermanTax)}` },
      ],
    },
    {
      option: "🇩🇪 Converted CHF",
      price: conversionResult.convertedAmount,
      description: "EUR converted to CHF (no tax adjustments)",
      percentageDiff:
        ((conversionResult.convertedAmount - referencePrice) / referencePrice) *
        100,
      calculationSteps: [
        { label: "Original price", formula: `€${fmt(eurAmount)}`, result: `€${fmt(eurAmount)}` },
        { label: "Convert to CHF", formula: `${fmt(eurAmount)} × ${rate.toFixed(4)}`, result: `CHF ${fmt(chfConverted)}` },
      ],
    }
  );

  // Sort by price (cheapest first)
  comparisons.sort((a, b) => a.price - b.price);

  return {
    swissPrice: swissPrice || 0,
    comparisons,
  };
}

/**
 * Formats percentage for display
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

/**
 * Formats savings percentage with color indication (positive/negative)
 */
export function formatSavingsPercentage(percentage: number): string {
  const formatted = formatPercentage(Math.abs(percentage));
  return percentage >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Formats percentage difference for comparison table
 */
export function formatPercentageDiff(percentage: number): string {
  if (percentage === 0) return "—"; // Reference point
  const formatted = Math.abs(percentage).toFixed(1);
  return percentage > 0 ? `+${formatted}%` : `-${formatted}%`;
}
