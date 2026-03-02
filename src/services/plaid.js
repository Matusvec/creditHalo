// Plaid Link stub - use real react-native-plaid-link-sdk when API keys provided
// Set PLAID_CLIENT_ID and PLAID_PUBLIC_KEY in env to enable real Plaid Link
const HAS_PLAID_KEYS = !!(process.env.EXPO_PUBLIC_PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID);

export const openPlaidLink = async (onSuccess, onExit) => {
  if (HAS_PLAID_KEYS) {
    // TODO: Integrate react-native-plaid-link-sdk when keys are configured
    // import { PlaidLink } from 'react-native-plaid-link-sdk';
    // PlaidLink.open({ ...config }, onSuccess, onExit);
  }
  // Stub: simulate successful link after short delay when no keys
  return new Promise((resolve) => {
    setTimeout(() => {
      onSuccess?.({ publicToken: 'stub-token' });
      resolve({ success: true });
    }, 1500);
  });
};

export const getAccountAnalysis = async () => {
  // Stub: return mock analysis suggestions
  return [
    'Set up autopay to avoid missed payments',
    'Reduce credit utilization below 30%',
    'Consider paying off high-interest balances first',
    'Build an emergency fund of 3-6 months expenses',
    'Review your spending in the "Restaurants" category',
  ];
};
