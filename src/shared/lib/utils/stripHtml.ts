/**
 * Loại bỏ các thẻ HTML và các thực thể HTML phổ biến (như &nbsp;, &amp;...) khỏi chuỗi văn bản.
 * Dùng cho hiển thị nội dung tóm tắt trên các thẻ Card để tránh làm vỡ layout.
 */
export function stripHtml(html?: string | null): string {
  if (!html) return "";
  
  // Loại bỏ các thẻ HTML
  let text = html.replace(/<[^>]*>/g, "");
  
  // Thay thế các thực thể HTML phổ biến
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
    
  return text.trim();
}
