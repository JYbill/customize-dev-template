/**
 * SQL写入转化
 */
export const insertStr = (
  paramsData: Record<string, any> = {},
  paramsDataMap: Record<string, string> = {},
) => {
  const entries = Object.entries(paramsData).filter(
    ([, value]) => value !== undefined && (value || value === 0 || value === ""),
  );
  const fieldStr = entries.map(([key]) => paramsDataMap[key] || key).join(",");
  const valueStr = entries.map(([key]) => `:${key}`).join(",");
  return { fieldStr, valueStr };
};

/**
 * SQL更新转化
 */
export const updateStr = (
  paramsData: Record<string, any> = {},
  paramsDataMap: Record<string, string> = {},
) => {
  const entries = Object.entries(paramsData).filter(
    ([, value]) => value !== undefined && (value || value === 0 || value === ""),
  );
  const valueStr = entries.map(([key]) => `${paramsDataMap[key] || key} = :${key}`).join(", ");
  return { valueStr };
};
