export function getNetworkStats() {
  const resources = performance.getEntriesByType("resource");
  let totalBytes = 0;

  resources.forEach((res) => {
    if ("transferSize" in res) totalBytes += (res as any).transferSize;
  });

  // Optional: categorize by type
  const typeCounts: Record<string, number> = {};
  resources.forEach((res) => {
    const type = (res as any).initiatorType || "other";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return {
    totalRequests: resources.length,
    totalBytes,
    typeCounts,
  };
}