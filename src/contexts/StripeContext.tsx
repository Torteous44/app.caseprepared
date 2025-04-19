import React, { ReactNode, createContext, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, StripeElementsOptions } from "@stripe/stripe-js";

// Use test key for development
const STRIPE_PUBLISHABLE_KEY =
  "pk_live_51RCljOIzbD323IQGdPHzEwuFDd4cgk7o3vXmUQCFvtZRlGVIWyxLlODdiEbVykwatPYkNsVsT15QvofKM87fhzWi003bx0CZPa";
// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Define custom appearance for Stripe Elements
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2a9d8f",
    colorBackground: "#ffffff",
    colorText: "#424770",
    colorDanger: "#e76f51",
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    spacingUnit: "4px",
    borderRadius: "4px",
  },
  rules: {
    ".Label": {
      marginBottom: "8px",
      fontWeight: "500",
    },
    ".Input": {
      padding: "12px",
    },
    ".Tab": {
      padding: "10px 16px",
      borderRadius: "4px",
    },
    ".Tab:hover": {
      color: "#2a9d8f",
    },
    ".Tab--selected": {
      borderColor: "#2a9d8f",
      color: "#2a9d8f",
    },
  },
};

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string | null;
}

// Context for Stripe-related functionality
export const StripeContext = createContext<null>(null);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error("useStripe must be used within a StripeProvider");
  }
  return context;
};

export const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  clientSecret,
}) => {
  const options: StripeElementsOptions = {
    appearance,
    locale: "auto", // Valid values are 'auto', 'ar', 'bg', 'cs', 'da', 'de', etc.
  };

  // Add clientSecret to options if available
  if (clientSecret) {
    options.clientSecret = clientSecret;
  }

  return (
    <StripeContext.Provider value={null}>
      <Elements stripe={stripePromise} options={options}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};

export default StripeContext;
