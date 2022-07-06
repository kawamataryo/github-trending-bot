export const toNumber = (maybeNumber?: string): number => {
  if (!maybeNumber) return 0;
  const removed = maybeNumber.replace(/,/g, "").replace(/\s/g, "");
  return parseInt(removed, 10);
};
