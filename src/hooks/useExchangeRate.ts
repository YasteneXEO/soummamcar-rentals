import { useState, useEffect } from "react";

interface ExchangeRateResult {
  rate: number | null;
  loading: boolean;
  convert: (amountDZD: number) => string;
}

export function useExchangeRate(enabled: boolean): ExchangeRateResult {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);

    fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=DZD")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.rates?.DZD) {
          // rate = how many DZD per 1 EUR
          setRate(data.rates.DZD);
        }
      })
      .catch(() => {
        // Fallback rate if API fails
        if (!cancelled) setRate(150);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [enabled]);

  const convert = (amountDZD: number): string => {
    if (!rate || rate === 0) return "...";
    return (amountDZD / rate).toFixed(2);
  };

  return { rate, loading, convert };
}
