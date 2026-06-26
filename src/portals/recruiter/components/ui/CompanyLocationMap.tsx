"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Search } from "lucide-react";

interface CompanyLocationMapProps {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string, address?: string) => void;
}

export function CompanyLocationMap({
  latitude,
  longitude,
  onChange,
}: CompanyLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Mặc định Hà Nội nếu chưa có tọa độ
  const defaultLat = 21.028511;
  const defaultLng = 105.804817;

  const initialLat = latitude ? parseFloat(latitude) : defaultLat;
  const initialLng = longitude ? parseFloat(longitude) : defaultLng;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Khởi tạo bản đồ nếu chưa có
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: latitude && longitude ? 15 : 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Icon hình kim ghim bản đồ (Map Pin) màu đỏ sắc nét
      const customIcon = L.divIcon({
        className: "custom-marker-icon",
        html: `<div class="relative -top-2 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" class="drop-shadow-md">
                   <!-- Thân kim ghim (Màu đỏ chính) -->
                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.5" />
                   <!-- Nhụy tròn bên trong (Màu đỏ đậm) -->
                   <circle cx="12" cy="9" r="3" fill="#7f1d1d" />
                 </svg>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 34], // Đặt neo vào đúng điểm nhọn phía dưới cùng của kim ghim
      });

      // Tạo marker
      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
      }).addTo(map);

      markerRef.current = marker;
      mapRef.current = map;

      // Sự kiện click bản đồ để chọn tọa độ
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);

        // Gọi reverse geocoding lấy địa chỉ
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`,
          );
          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name ?? "";
            onChange(lat.toFixed(6), lng.toFixed(6), displayName);
          } else {
            onChange(lat.toFixed(6), lng.toFixed(6));
          }
        } catch (error) {
          onChange(lat.toFixed(6), lng.toFixed(6));
        }
      });
    }

    return () => {
      // Dọn dẹp bản đồ khi component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Cập nhật vị trí marker khi props thay đổi từ bên ngoài
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    if (latitude && longitude) {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        markerRef.current.setLatLng([latNum, lngNum]);
        mapRef.current.setView([latNum, lngNum], mapRef.current.getZoom());
      }
    }
  }, [latitude, longitude]);

  // Hàm tìm kiếm địa chỉ (Geocoding)
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    if (!addressSearch.trim() || !mapRef.current || !markerRef.current) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addressSearch,
        )}&limit=1&accept-language=vi`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lon);

          markerRef.current.setLatLng([latNum, lngNum]);
          mapRef.current.setView([latNum, lngNum], 16);
          onChange(latNum.toFixed(6), lngNum.toFixed(6), display_name);
        } else {
          setSearchError(
            "Không tìm thấy địa điểm này. Hãy thử nhập địa chỉ ngắn gọn hơn (ví dụ: '66 Trung Văn, Hà Nội') hoặc click chọn trực tiếp trên bản đồ.",
          );
        }
      } else {
        setSearchError("Không thể kết nối đến dịch vụ bản đồ lúc này.");
      }
    } catch (error) {
      console.error("Tìm kiếm địa chỉ thất bại", error);
      setSearchError("Đã xảy ra lỗi khi kết nối với máy chủ bản đồ.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Thanh tìm kiếm trên bản đồ */}
      <form onSubmit={handleSearchAddress} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm địa điểm công ty trên bản đồ..."
            value={addressSearch}
            onChange={(e) => setAddressSearch(e.target.value)}
            className="w-full rounded-2xl border border-outline-variant/35 bg-surface pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm hover:bg-primary-hover disabled:opacity-50 transition flex items-center gap-1.5 shrink-0"
        >
          {isSearching ? "Đang tìm..." : "Tìm"}
        </button>
      </form>

      {/* Thông báo lỗi tìm kiếm */}
      {searchError && (
        <p className="text-xs text-error font-medium px-1">⚠️ {searchError}</p>
      )}

      {/* Container bản đồ */}
      <div className="relative h-80 sm:h-100 w-full overflow-hidden rounded-3xl border border-outline-variant/30 shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Nút định vị nhanh về vị trí hiện tại của marker */}
        {latitude && longitude && (
          <button
            type="button"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(
                  [parseFloat(latitude), parseFloat(longitude)],
                  16,
                );
              }
            }}
            className="absolute bottom-4 right-4 z-400 flex h-10 w-10 items-center justify-center rounded-full bg-white text-on-surface shadow-md hover:bg-surface-container-low transition border border-outline-variant/20"
            title="Định vị vị trí hiện tại"
          >
            <MapPin className="h-5 w-5 text-primary" />
          </button>
        )}
      </div>
      <p className="text-[13px] text-on-surface-variant flex items-center gap-1">
        💡{" "}
        <i>
          Mẹo: Lựa chọn vị trí công ty bất kỳ điểm nào trên bản đồ để chọn tọa
          độ và tự động điền địa chỉ.
        </i>
      </p>
    </div>
  );
}
