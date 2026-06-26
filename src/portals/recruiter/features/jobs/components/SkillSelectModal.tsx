"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X, Check } from "lucide-react";
import { fetchSkills } from "@/shared/services/skill.service";
import type { SkillApiItem } from "@/shared/types/skill";
import { BaseButton } from "@/shared/components/ui/BaseButton";

interface SkillSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  careerCategoryId?: string;
  selectedSkillIds: string[];
  onSelectSkills: (skills: { id: string; name: string }[]) => void;
}

export function SkillSelectModal({
  isOpen,
  onClose,
  careerCategoryId,
  selectedSkillIds,
  onSelectSkills,
}: SkillSelectModalProps) {
  const [skills, setSkills] = useState<SkillApiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);

  // Đồng bộ hóa kỹ năng đã chọn từ ngoài vào khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTempSelectedIds(selectedSkillIds);
      setSearchQuery("");
    }
  }, [isOpen, selectedSkillIds]);

  // Tải danh sách kỹ năng theo lĩnh vực
  useEffect(() => {
    if (!isOpen || !careerCategoryId) return;

    async function loadSkills() {
      setLoading(true);
      try {
        const result = await fetchSkills({
          careerCategoryId,
          limit: 150, // Lấy nhiều để bao quát hết cây kỹ năng của 1 lĩnh vực
        });
        setSkills(result.skills);
      } catch (err) {
        console.error("Không thể tải danh sách kỹ năng:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadSkills();
  }, [isOpen, careerCategoryId]);

  // Lọc cây kỹ năng theo tìm kiếm
  const filteredSkillsTree = useMemo(() => {
    if (!searchQuery.trim()) return skills;

    const query = searchQuery.toLowerCase().trim();

    return skills
      .map((parent) => {
        // Lọc các kỹ năng con khớp từ khóa
        const matchedChildren = (parent.children ?? []).filter(
          (child) =>
            child.name.toLowerCase().includes(query) ||
            (child.slug ?? "").toLowerCase().includes(query),
        );

        // Nếu kỹ năng cha khớp từ khóa, giữ nguyên cả cha và con
        const parentMatches =
          parent.name.toLowerCase().includes(query) ||
          (parent.slug ?? "").toLowerCase().includes(query);

        if (parentMatches) {
          return parent;
        }

        // Nếu chỉ kỹ năng con khớp, trả về cha kèm theo danh sách con đã lọc
        if (matchedChildren.length > 0) {
          return {
            ...parent,
            children: matchedChildren,
          };
        }

        return null;
      })
      .filter((item): item is SkillApiItem => Boolean(item));
  }, [skills, searchQuery]);

  if (!isOpen) return null;

  const handleToggleSkill = (skillId: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  const handleConfirm = () => {
    // Thu thập thông tin đầy đủ { id, name } của các kỹ năng đã chọn
    const selectedSkillsData: { id: string; name: string }[] = [];

    skills.forEach((parent) => {
      // Check kỹ năng cha
      if (tempSelectedIds.includes(parent.id)) {
        selectedSkillsData.push({ id: parent.id, name: parent.name });
      }
      // Check các kỹ năng con
      (parent.children ?? []).forEach((child) => {
        if (tempSelectedIds.includes(child.id)) {
          selectedSkillsData.push({ id: child.id, name: child.name });
        }
      });
    });

    onSelectSkills(selectedSkillsData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 flex h-[80vh] w-full max-w-2xl flex-col rounded-[28px] bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
          <div>
            <h3 className="text-lg font-bold text-on-surface">
              Kỹ năng từ hệ thống
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Chọn các kỹ năng chuyên môn phù hợp với công việc của bạn
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thanh tìm kiếm nhanh */}
        <div className="relative mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm kỹ năng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-outline-variant/35 bg-surface pl-10 pr-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Danh sách kỹ năng dạng cây */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-on-surface-variant">
              Đang tải danh sách kỹ năng...
            </div>
          ) : filteredSkillsTree.length > 0 ? (
            filteredSkillsTree.map((parent) => (
              <div key={parent.id} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {parent.name}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(parent.children ?? []).map((child) => {
                    const isChecked = tempSelectedIds.includes(child.id);
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleToggleSkill(child.id)}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 text-left text-sm font-semibold transition ${
                          isChecked
                            ? "border-primary bg-primary-soft text-primary shadow-sm"
                            : "border-outline-variant/30 bg-surface hover:bg-slate-50 text-on-surface"
                        }`}
                      >
                        <span className="truncate pr-2">{child.name}</span>
                        {isChecked && (
                          <span className="shrink-0 rounded-full bg-primary p-0.5 text-on-primary">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-on-surface-variant">
                Không tìm thấy kỹ năng nào phù hợp.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/15">
          <p className="text-xs font-semibold text-primary">
            Đã chọn {tempSelectedIds.length} kỹ năng
          </p>
          <div className="flex items-center gap-2">
            <BaseButton variant="secondary" onClick={onClose}>
              Hủy bỏ
            </BaseButton>
            <BaseButton onClick={handleConfirm} disabled={loading}>
              Xác nhận
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  );
}
