import React, { useEffect, useState, useRef } from "react";

type AreaItem = {
  code: number;
  name: string;
};

type AddressSelectorProps = {
  initialAddress?: string;
  onChange: (fullAddress: string) => void;
};

const FALLBACK_DATA: Record<
  string,
  { name: string; districts: Record<string, { name: string; wards: string[] }> }
> = {
  "1": {
    name: "Thành phố Hà Nội",
    districts: {
      "1": {
        name: "Quận Ba Đình",
        wards: [
          "Phường Phúc Xá",
          "Phường Trúc Bạch",
          "Phường Vĩnh Phúc",
          "Phường Cống Vị",
          "Phường Kim Mã",
          "Phường Ngọc Khánh",
        ],
      },
      "2": {
        name: "Quận Hoàn Kiếm",
        wards: [
          "Phường Đồng Xuân",
          "Phường Hàng Mã",
          "Phường Hàng Buồm",
          "Phường Hàng Đào",
          "Phường Hàng Bồ",
          "Phường Cửa Đông",
        ],
      },
      "3": {
        name: "Quận Tây Hồ",
        wards: [
          "Phường Phú Thượng",
          "Phường Nhật Tân",
          "Phường Quảng An",
          "Phường Xuân La",
          "Phường Bưởi",
          "Phường Thụy Khuê",
        ],
      },
    },
  },
  "79": {
    name: "Thành phố Hồ Chí Minh",
    districts: {
      "760": {
        name: "Quận 1",
        wards: [
          "Phường Tân Định",
          "Phường Đa Kao",
          "Phường Bến Nghé",
          "Phường Bến Thành",
          "Phường Nguyễn Thái Bình",
          "Phường Phạm Ngũ Lão",
        ],
      },
      "764": {
        name: "Quận Gò Vấp",
        wards: [
          "Phường 1",
          "Phường 3",
          "Phường 4",
          "Phường 5",
          "Phường 6",
          "Phường 7",
          "Phường 8",
        ],
      },
      "769": {
        name: "Thành phố Thủ Đức",
        wards: [
          "Phường Linh Xuân",
          "Phường Linh Trung",
          "Phường Linh Chiểu",
          "Phường Trường Thọ",
          "Phường Bình Thọ",
          "Phường Linh Đông",
        ],
      },
    },
  },
  "48": {
    name: "Thành phố Đà Nẵng",
    districts: {
      "490": {
        name: "Quận Hải Châu",
        wards: [
          "Phường Thanh Bình",
          "Phường Thuận Phước",
          "Phường Thạch Thang",
          "Phường Hải Châu I",
          "Phường Hải Châu II",
        ],
      },
      "492": {
        name: "Quận Thanh Khê",
        wards: [
          "Phường Tam Thuận",
          "Phường Xuân Hà",
          "Phường Tân Chính",
          "Phường Chính Gián",
          "Phường Vĩnh Trung",
        ],
      },
    },
  },
};

export default function AddressSelector({
  initialAddress = "",
  onChange,
}: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<AreaItem[]>([]);
  const [districts, setDistricts] = useState<AreaItem[]>([]);
  const [wards, setWards] = useState<AreaItem[]>([]);

  const [provinceCode, setProvinceCode] = useState<string>("");
  const [districtCode, setDistrictCode] = useState<string>("");
  const [wardCode, setWardCode] = useState<string>("");
  const [specificAddress, setSpecificAddress] = useState<string>("");

  const [isOffline, setIsOffline] = useState(false);
  const isInitializedRef = useRef(false);

  // Load provinces on mount
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        const sorted = data.sort((a: any, b: any) => a.name.localeCompare(b.name, "vi"));
        setProvinces(sorted);
        setIsOffline(false);
      })
      .catch(() => {
        // Fallback to local offline data
        const localProvinces = Object.entries(FALLBACK_DATA).map(([code, p]) => ({
          code: Number(code),
          name: p.name,
        })).sort((a, b) => a.name.localeCompare(b.name, "vi"));
        setProvinces(localProvinces);
        setIsOffline(true);
      });
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      return;
    }

    if (isOffline) {
      const localDistricts = Object.entries(
        FALLBACK_DATA[provinceCode]?.districts || {}
      ).map(([code, d]) => ({
        code: Number(code),
        name: d.name,
      })).sort((a, b) => a.name.localeCompare(b.name, "vi"));
      setDistricts(localDistricts);
      setDistrictCode("");
      return;
    }

    fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data.districts || []).sort((a: any, b: any) => a.name.localeCompare(b.name, "vi"));
        setDistricts(sorted);
        setDistrictCode("");
      })
      .catch((err) => {
        console.error("Lỗi tải quận/huyện:", err);
        setDistricts([]);
        setDistrictCode("");
      });
  }, [provinceCode, isOffline]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      setWardCode("");
      return;
    }

    if (isOffline) {
      const localWards = (
        FALLBACK_DATA[provinceCode]?.districts[districtCode]?.wards || []
      ).map((w, idx) => ({
        code: idx + 1,
        name: w,
      })).sort((a, b) => a.name.localeCompare(b.name, "vi"));
      setWards(localWards);
      setWardCode("");
      return;
    }

    fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data.wards || []).sort((a: any, b: any) => a.name.localeCompare(b.name, "vi"));
        setWards(sorted);
        setWardCode("");
      })
      .catch((err) => {
        console.error("Lỗi tải phường/xã:", err);
        setWards([]);
        setWardCode("");
      });
  }, [districtCode, provinceCode, isOffline]);

  // Handle parsing initialAddress once provinces are loaded
  useEffect(() => {
    if (isInitializedRef.current || provinces.length === 0 || !initialAddress) return;

    const parts = initialAddress.split(",").map((p) => p.trim());
    if (parts.length < 2) {
      setSpecificAddress(initialAddress);
      isInitializedRef.current = true;
      return;
    }

    const provPart = parts[parts.length - 1];
    const distPart = parts[parts.length - 2];
    const wardPart = parts.length >= 3 ? parts[parts.length - 3] : "";

    const specAddress = parts.slice(0, parts.length >= 3 ? parts.length - 3 : parts.length - 2).join(", ");
    setSpecificAddress(specAddress);

    // Try to find matching province
    const matchProvince = provinces.find(
      (p) =>
        p.name.toLowerCase().includes(provPart.toLowerCase()) ||
        provPart.toLowerCase().includes(p.name.toLowerCase()) ||
        (provPart.toLowerCase() === "tphcm" && p.code === 79)
    );

    if (matchProvince) {
      const pCode = String(matchProvince.code);
      setProvinceCode(pCode);

      // Load districts to find match
      const pUrl = isOffline
        ? null
        : `https://provinces.open-api.vn/api/p/${pCode}?depth=2`;

      const getDistrictsPromise = isOffline
        ? Promise.resolve(
            Object.entries(FALLBACK_DATA[pCode]?.districts || {}).map(([c, d]) => ({
              code: Number(c),
              name: d.name,
            })).sort((a, b) => a.name.localeCompare(b.name, "vi"))
          )
        : fetch(pUrl!)
            .then((r) => r.json())
            .then((d) => (d.districts || []).sort((a: any, b: any) => a.name.localeCompare(b.name, "vi")));

      getDistrictsPromise.then((dList) => {
        setDistricts(dList);
        const matchDistrict = dList.find(
          (d: any) =>
            d.name.toLowerCase().includes(distPart.toLowerCase()) ||
            distPart.toLowerCase().includes(d.name.toLowerCase())
        );

        if (matchDistrict) {
          const dCode = String(matchDistrict.code);
          setDistrictCode(dCode);

          if (wardPart) {
            // Load wards to find match
            const dUrl = isOffline
              ? null
              : `https://provinces.open-api.vn/api/d/${dCode}?depth=2`;

            const getWardsPromise = isOffline
              ? Promise.resolve(
                  (FALLBACK_DATA[pCode]?.districts[dCode]?.wards || []).map((w, i) => ({
                    code: i + 1,
                    name: w,
                  })).sort((a, b) => a.name.localeCompare(b.name, "vi"))
                )
              : fetch(dUrl!)
                  .then((r) => r.json())
                  .then((d) => (d.wards || []).sort((a: any, b: any) => a.name.localeCompare(b.name, "vi")));

            getWardsPromise.then((wList) => {
              setWards(wList);
              const matchWard = wList.find(
                (w: any) =>
                  w.name.toLowerCase().includes(wardPart.toLowerCase()) ||
                  wardPart.toLowerCase().includes(w.name.toLowerCase())
              );
              if (matchWard) {
                setWardCode(String(matchWard.code));
              }
            });
          }
        }
      });
    }

    isInitializedRef.current = true;
  }, [provinces, initialAddress, isOffline]);

  // Combine address values and trigger onChange
  useEffect(() => {
    const selectedProv = provinces.find((p) => String(p.code) === provinceCode);
    const selectedDist = districts.find((d) => String(d.code) === districtCode);
    const selectedW = wards.find((w) => String(w.code) === wardCode);

    const parts: string[] = [];
    if (specificAddress.trim()) parts.push(specificAddress.trim());
    if (selectedW) parts.push(selectedW.name);
    if (selectedDist) parts.push(selectedDist.name);
    if (selectedProv) parts.push(selectedProv.name);

    const combinedAddress = parts.join(", ");
    onChange(combinedAddress);
  }, [provinceCode, districtCode, wardCode, specificAddress, provinces, districts, wards]);

  return (
    <div style={{ display: "grid", gap: "14px", marginTop: "6px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div>
          <span style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Tỉnh / Thành phố *</span>
          <select
            value={provinceCode}
            onChange={(e) => setProvinceCode(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", backgroundColor: "#fff", color: "#334155" }}
            required
          >
            <option value="">-- Chọn Tỉnh/TP --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Quận / Huyện *</span>
          <select
            value={districtCode}
            onChange={(e) => setDistrictCode(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", backgroundColor: "#fff", color: "#334155" }}
            disabled={!provinceCode}
            required
          >
            <option value="">-- Chọn Quận/Huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Phường / Xã *</span>
          <select
            value={wardCode}
            onChange={(e) => setWardCode(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", backgroundColor: "#fff", color: "#334155" }}
            disabled={!districtCode}
            required
          >
            <option value="">-- Chọn Phường/Xã --</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: 600 }}>Số nhà, ngõ ngách, tên đường *</span>
        <input
          type="text"
          value={specificAddress}
          onChange={(e) => setSpecificAddress(e.target.value)}
          placeholder="Ví dụ: Số 25 ngõ 168 Hào Nam"
          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "15px", color: "#334155" }}
          required
        />
      </div>

      {isOffline && (
        <small style={{ color: "#d97706", fontStyle: "italic" }}>
          * Đang hoạt động ở chế độ ngoại tuyến (dự phòng). Bạn có thể chọn Hà Nội, TP.HCM hoặc Đà Nẵng.
        </small>
      )}
    </div>
  );
}
