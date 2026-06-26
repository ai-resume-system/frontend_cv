function toSalaryMillion(value?: number): number | undefined {
  if (typeof value !== "number") return undefined;
  return value / 1000000;
}

function formatMillionValue(value: number): string {
  return Number.isInteger(value)
    ? value.toLocaleString("vi-VN")
    : value.toLocaleString("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
}

export function formatSalary(min?: number, max?: number): string | undefined {
  const salaryMin = toSalaryMillion(min);
  const salaryMax = toSalaryMillion(max);

  if ((!salaryMin && !salaryMax) || (salaryMin === 0 && salaryMax === 0)) {
    return "Thỏa thuận";
  }

  if (typeof salaryMin === "number" && typeof salaryMax === "number") {
    return `${formatMillionValue(salaryMin)} - ${formatMillionValue(salaryMax)} triệu`;
  }

  if (typeof salaryMin === "number") {
    return `Từ ${formatMillionValue(salaryMin)} triệu`;
  }

  if (typeof salaryMax === "number") {
    return `Đến ${formatMillionValue(salaryMax)} triệu`;
  }

  return "Thỏa thuận";
}

/**
 * Định dạng số tiền thành chuỗi tiền tệ (VD: 15.000.000 VNĐ)
 */
export function formatCurrency(value?: number | null, suffix = "VNĐ"): string {
  if (value == null) return "";
  const formatted = new Intl.NumberFormat("vi-VN").format(value);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

