export const getErrorText = (error: Error | string): string => {
  return error instanceof Error ? error.message : error;
};
