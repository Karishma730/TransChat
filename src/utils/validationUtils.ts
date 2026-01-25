export const isValidDisplayName = (displayName: string): boolean => {
  if (!displayName || displayName.trim().length === 0) {
    return false;
  }
  const validPattern = /^[a-zA-Z0-9_]+$/;
  return validPattern.test(displayName);
};

export const getDisplayNameError = (): string => {
  return 'Display name can only contain letters (a-z, A-Z), numbers (0-9), and underscores (_). Please try another name.';
};
