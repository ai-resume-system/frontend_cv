export default function PrivacyPage() {
  return (
    <section className="bg-slate-50 min-h-screen py-5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 shadow-sm border border-slate-100">
        <h1 className="text-3xl text-center font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
          Chính sách bảo mật thông tin
        </h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="font-semibold text-slate-800 text-lg">
            Tại FUSE, sự riêng tư và bảo mật thông tin cá nhân của bạn là ưu
            tiên hàng đầu của chúng tôi.
          </p>
          <p>
            Chính sách bảo mật này mô tả cách chúng tôi thu thập, sử dụng, lưu
            trữ và bảo vệ dữ liệu cá nhân của bạn khi bạn sử dụng nền tảng tuyển
            dụng FUSE.
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            1. Thông tin chúng tôi thu thập
          </h2>
          <p>
            Chúng tôi thu thập các thông tin sau nhằm phục vụ mục đích phân tích
            hồ sơ và kết nối tuyển dụng:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Thông tin tài khoản:</strong> Họ và tên, địa chỉ email, số
              điện thoại và mật khẩu mã hóa.
            </li>
            <li>
              <strong>Hồ sơ ứng viên (CV):</strong> Thông tin về kỹ năng, lịch
              sử làm việc, học vấn và các thông tin khác có trong tệp CV của bạn
              tải lên.
            </li>
            <li>
              <strong>Dữ liệu phân tích:</strong> Các thông tin do hệ thống AI
              trích xuất và đề xuất dựa trên CV và thông tin ứng tuyển của bạn.
            </li>
          </ul>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            2. Cách chúng tôi sử dụng thông tin
          </h2>
          <p>Dữ liệu thu thập được sử dụng để:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Cung cấp và cải thiện các dịch vụ phân tích CV bằng AI.</li>
            <li>
              Giúp bạn ứng tuyển vào các tin tuyển dụng của các doanh nghiệp đối
              tác một cách trực tiếp.
            </li>
            <li>Gợi ý và đề xuất việc làm tương thích với kỹ năng của bạn.</li>
          </ul>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            3. Bảo vệ và chia sẻ thông tin
          </h2>
          <p>
            Chúng tôi cam kết sử dụng các công nghệ bảo mật tiên tiến để mã hóa
            và lưu trữ dữ liệu cá nhân. Chúng tôi{" "}
            <strong>không bán hoặc chia sẻ thông tin của bạn</strong> cho bên
            thứ ba vì mục đích quảng cáo hoặc mục đích nào khác mà không có sự
            đồng ý của bạn, ngoại trừ các nhà tuyển dụng mà bạn chủ động lựa
            chọn nộp hồ sơ ứng tuyển.
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            4. Quyền của người dùng
          </h2>
          <p>
            Bạn có quyền truy cập, chỉnh sửa, tải xuống hoặc yêu cầu xóa bỏ vĩnh
            viễn hồ sơ và thông tin cá nhân của mình trên hệ thống FUSE bất kỳ
            lúc nào thông qua phần quản lý tài khoản cá nhân.
          </p>
          <p className="pt-6 border-t border-slate-100 text-slate-500 text-xs sm:text-sm">
            Cập nhật lần cuối: Tháng 6 năm 2026.
          </p>
        </div>
      </div>
    </section>
  );
}
