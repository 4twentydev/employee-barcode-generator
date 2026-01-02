export const formatEmployeeName = (name: string): string => {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex !== -1) {
    const lastName = trimmed.slice(0, commaIndex).trim();
    const remainder = trimmed.slice(commaIndex + 1).trim();
    return remainder ? `${lastName}, ${remainder}` : lastName;
  }

  const parts = trimmed.split(" ");
  if (parts.length === 1) return trimmed;

  const lastName = parts[parts.length - 1];
  const firstMiddle = parts.slice(0, -1).join(" ");
  return `${lastName}, ${firstMiddle}`;
};

export const formatEmployeeBarcode = (employeeNumber: string): string =>
  employeeNumber.trim();
