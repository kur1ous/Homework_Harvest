import React, { createContext, useContext, useState, ReactNode } from 'react';

type CurrencyContextType = {
  currency: number;
  add_currency: (amount: number) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState(0);

  const add_currency = (amount: number) => {
    setCurrency(prev => prev + amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, add_currency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};