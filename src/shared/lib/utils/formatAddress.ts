function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

interface ProvinceMatch {
  keywords: string[];
  name: string;
}

const PROVINCE_MATCHES: ProvinceMatch[] = [
  { keywords: ["ho chi minh", "hcm", "sai gon", "saigon", "tp hcm", "tp.hcm", "tp. hcm"], name: "TP. Hồ Chí Minh" },
  { keywords: ["ha noi", "hanoi", "hn"], name: "Hà Nội" },
  { keywords: ["da nang", "danang", "dn"], name: "Đà Nẵng" },
  { keywords: ["hai phong", "haiphong", "hp"], name: "Hải Phòng" },
  { keywords: ["can tho", "cantho", "ct"], name: "Cần Thơ" },
  { keywords: ["binh duong", "binhduong", "bd"], name: "Bình Dương" },
  { keywords: ["dong nai", "dongnai", "dnai"], name: "Đồng Nai" },
  { keywords: ["khanh hoa", "khanhhoa", "nha trang", "nhatrang"], name: "Khánh Hòa" },
  { keywords: ["lam dong", "lamdong", "da lat", "dalat"], name: "Lâm Đồng" },
  { keywords: ["quang ninh", "quangninh"], name: "Quảng Ninh" },
  { keywords: ["thua thien hue", "hue", "tthue"], name: "Thừa Thiên Huế" },
  { keywords: ["ba ria vung tau", "ba ria - vung tau", "vung tau", "brvt"], name: "Bà Rịa - Vũng Tàu" },
  { keywords: ["long an", "longan", "la"], name: "Long An" },
  { keywords: ["tien giang", "tiengiang", "tg"], name: "Tiền Giang" },
  { keywords: ["ben tre", "bentre", "bt"], name: "Bến Tre" },
  { keywords: ["tra vinh", "travinh", "tv"], name: "Trà Vinh" },
  { keywords: ["vinh long", "vinhlong", "vl"], name: "Vĩnh Long" },
  { keywords: ["dong thap", "dongthap", "dt"], name: "Đồng Tháp" },
  { keywords: ["an giang", "angiang", "ag"], name: "An Giang" },
  { keywords: ["kien giang", "kiengiang", "kg"], name: "Kiên Giang" },
  { keywords: ["ca mau", "camau", "cm"], name: "Cà Mau" },
  { keywords: ["bac lieu", "baclieu", "bl"], name: "Bạc Liêu" },
  { keywords: ["soc trang", "soctrang", "st"], name: "Sóc Trăng" },
  { keywords: ["tay ninh", "tayninh", "tn"], name: "Tây Ninh" },
  { keywords: ["binh phuoc", "binhphuoc", "bp"], name: "Bình Phước" },
  { keywords: ["ninh thuan", "ninhthuan", "nt"], name: "Ninh Thuận" },
  { keywords: ["binh thuan", "binhthuan", "bt"], name: "Bình Thuận" },
  { keywords: ["kon tum", "kontum", "kt"], name: "Kon Tum" },
  { keywords: ["gia lai", "gialai", "gl"], name: "Gia Lai" },
  { keywords: ["dak lak", "daklak", "dack lack"], name: "Đắk Lắk" },
  { keywords: ["dak nong", "daknong"], name: "Đắk Nông" },
  { keywords: ["phu yen", "phuyen", "py"], name: "Phú Yên" },
  { keywords: ["binh dinh", "binhdinh", "bd"], name: "Bình Định" },
  { keywords: ["quang ngai", "quangngai", "qn"], name: "Quảng Ngãi" },
  { keywords: ["quang nam", "quangnam", "qn"], name: "Quảng Nam" },
  { keywords: ["quang tri", "quangtri", "qt"], name: "Quảng Trị" },
  { keywords: ["quang binh", "quangbinh", "qb"], name: "Quảng Bình" },
  { keywords: ["ha tinh", "hatinh", "ht"], name: "Hà Tĩnh" },
  { keywords: ["nghe an", "nghean", "na"], name: "Nghệ An" },
  { keywords: ["thanh hoa", "thanhhoa", "th"], name: "Thanh Hóa" },
  { keywords: ["ninh binh", "ninhbinh", "nb"], name: "Ninh Bình" },
  { keywords: ["nam dinh", "namdinh", "nd"], name: "Nam Định" },
  { keywords: ["ha nam", "hanam", "hn"], name: "Hà Nam" },
  { keywords: ["thai binh", "thaibinh", "tb"], name: "Thái Bình" },
  { keywords: ["hai duong", "haiduong", "hd"], name: "Hải Dương" },
  { keywords: ["hung yen", "hungyen", "hy"], name: "Hưng Yên" },
  { keywords: ["bac ninh", "bacninh", "bn"], name: "Bắc Ninh" },
  { keywords: ["vinh phuc", "vinhphuc", "vp"], name: "Vĩnh Phúc" },
  { keywords: ["phu tho", "phutho", "pt"], name: "Phú Thọ" },
  { keywords: ["thai nguyen", "thainguyen", "tn"], name: "Thái Nguyên" },
  { keywords: ["tuyen quang", "tuyenquang", "tq"], name: "Tuyên Quang" },
  { keywords: ["ha giang", "hagiang", "hg"], name: "Hà Giang" },
  { keywords: ["cao bang", "caobang", "cb"], name: "Cao Bằng" },
  { keywords: ["lang son", "langson", "ls"], name: "Lạng Sơn" },
  { keywords: ["bac kan", "backan", "bk"], name: "Bắc Kạn" },
  { keywords: ["yen bai", "yenbai", "yb"], name: "Yên Bái" },
  { keywords: ["lao cai", "laocai", "lc"], name: "Lào Cai" },
  { keywords: ["lai chau", "laichau", "lc"], name: "Lai Châu" },
  { keywords: ["son la", "sonla", "sl"], name: "Sơn La" },
  { keywords: ["dien bien", "dienbien", "db"], name: "Điện Biên" },
  { keywords: ["hoa binh", "hoabinh", "hb"], name: "Hòa Bình" },
  { keywords: ["bac giang", "bacgiang", "bg"], name: "Bắc Giang" },
  { keywords: ["hau giang", "haugiang", "hg"], name: "Hậu Giang" }
];

export function formatBriefAddress(address?: string | null): string {
  if (!address) return "Đang cập nhật";

  const normalizedAddress = removeAccents(address.toLowerCase());

  // Thử so khớp các tỉnh thành phổ biến trước
  for (const match of PROVINCE_MATCHES) {
    for (const keyword of match.keywords) {
      // Dùng regex để đảm bảo khớp trọn vẹn từ (word boundary)
      // e.g. tránh "ba ria vung tau" khớp nhầm "vung tau" hoặc ngược lại
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(normalizedAddress)) {
        return match.name;
      }
    }
  }

  // Fallback: Nếu không khớp danh sách tỉnh thành Việt Nam,
  // ta split dấu phẩy và phân tích từ cuối lên
  const parts = address.split(",").map((p) => p.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    // Bỏ qua quốc gia, zip code (toàn số) hoặc chuỗi rỗng
    if (
      /^(việt nam|vietnam|viet nam)$/i.test(part) ||
      /^\d+$/.test(part) ||
      !part
    ) {
      continue;
    }
    return part;
  }

  return address;
}
