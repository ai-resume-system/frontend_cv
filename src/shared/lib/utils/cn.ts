// Dùng để gộp nhiều class name lại với nhau, tự động lọc bỏ các giá trị false, null, undefined.
type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

