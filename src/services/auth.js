// Google Sign-In stub - use real @react-native-google-signin/google-signin when configured
export const signInWithGoogle = async () => {
  // Stub: return mock user when Google config/keys not provided
  return {
    id: 'stub-user-1',
    email: 'user@example.com',
    name: 'Demo User',
    photo: null,
  };
};

export const signOut = async () => {
  // Stub: clear session
  return true;
};

export const getCurrentUser = async () => {
  return null;
};
