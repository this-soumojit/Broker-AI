declare global {
  interface Window {
    Cashfree: (config: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        returnUrl: string;
      }) => Promise<any>;
    };
  }
}

export {};
