import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/shared/constants/constants/routes";

export default function AboutPage() {
  return (
    <section className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100">
        <Link
          href={ROUTES.HOME}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại Trang chủ</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
          Giới thiệu FUSE
        </h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="font-semibold text-slate-800 text-lg">
            Chào mừng bạn đến với FUSE - Nền tảng phân tích hồ sơ và kết nối
            việc làm thông minh bằng AI.
          </p>
          <p>
            FUSE được xây dựng với sứ mệnh kết nối hoàn hảo giữa ứng viên và
            doanh nghiệp bằng cách áp dụng công nghệ trí tuệ nhân tạo (AI) tiên
            tiến nhất để phân tích và tối ưu hóa hồ sơ tuyển dụng (CV).
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            Tầm nhìn và Sứ mệnh
          </h2>
          <p>
            Chúng tôi tin rằng mỗi cá nhân đều có một thế mạnh và tiềm năng nghề
            nghiệp riêng biệt. Mục tiêu của FUSE là loại bỏ các rào cản thông
            tin giữa nhà tuyển dụng và ứng viên, cung cấp trải nghiệm tuyển dụng
            khách quan, hiệu quả và nhanh chóng nhất.
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            Các tính năng cốt lõi của chúng tôi
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Phân tích CV thông minh:</strong> Tự động trích xuất kỹ
              năng, kinh nghiệm và chấm điểm độ phù hợp của CV với mô tả công
              việc (Job Description).
            </li>
            <li>
              <strong>Gợi ý việc làm phù hợp:</strong> Đưa ra các gợi ý cơ hội
              nghề nghiệp dựa trên năng lực cốt lõi của bạn.
            </li>
            <li>
              <strong>Hỗ trợ Nhà tuyển dụng:</strong> Tự động lọc và sắp xếp ứng
              viên tiềm năng theo mức độ tương thích.
            </li>
          </ul>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            Cam kết phát triển bền vững
          </h2>
          <p>
            FUSE không ngừng cải tiến công nghệ và thuật toán AI để mang lại kết
            quả chính xác nhất. Đồng thời, chúng tôi luôn đặt vấn đề bảo mật
            thông tin và quyền riêng tư dữ liệu của người dùng lên hàng đầu.
          </p>
          <p className="pt-6 border-t border-slate-100 text-slate-500 text-xs sm:text-sm">
            FUSE - Kiến tạo sự nghiệp bền vững.
          </p>
        </div>
      </div>
    </section>
  );
}
