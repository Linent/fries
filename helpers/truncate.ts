export const toTruncatedPercent = (value: number, decimals = 2) => {
  const factor = Math.pow(10, decimals + 2);
  return Math.floor(value * factor) / Math.pow(10, decimals);
};