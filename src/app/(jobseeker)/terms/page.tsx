export default function TermsPage() {
  return (
    <section className="bg-slate-50 min-h-screen py-5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white p-8 sm:p-12 shadow-sm border border-slate-100">
        <h1 className="text-3xl text-center font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
          Điều khoản sử dụng và Thỏa thuận dữ liệu cá nhân
        </h1>
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm sm:text-base leading-relaxed">
          <p className="font-semibold text-slate-800 text-lg">
            Chào mừng bạn đến với FUSE. Việc truy cập và sử dụng dịch vụ trên
            nền tảng đồng nghĩa với việc bạn đồng ý với các điều khoản dưới đây.
          </p>
          <p>
            Vui lòng đọc kỹ các điều khoản này để hiểu rõ quyền lợi và nghĩa vụ
            của mình khi sử dụng FUSE.
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            1. Chấp nhận các điều khoản
          </h2>
          <p>
            Bằng việc đăng ký tài khoản, tải lên hồ sơ CV hoặc nộp hồ sơ ứng
            tuyển trên hệ thống FUSE, bạn xác nhận rằng bạn đã đọc, hiểu và đồng
            ý bị ràng buộc bởi các điều khoản sử dụng này. Nếu không đồng ý, bạn
            vui lòng ngừng sử dụng nền tảng.
          </p>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            2. Thỏa thuận sử dụng dữ liệu cá nhân
          </h2>
          <p>Khi bạn ứng tuyển một công việc cụ thể:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Bạn đồng ý cung cấp thông tin cá nhân bao gồm: Họ tên, số điện
              thoại, email liên hệ và tệp tin CV cho Nhà tuyển dụng sở hữu tin
              tuyển dụng đó.
            </li>
            <li>
              Nhà tuyển dụng có quyền sử dụng dữ liệu của bạn nhằm mục đích đánh
              giá hồ sơ, liên hệ phỏng vấn và thực hiện quy trình tuyển dụng nội
              bộ.
            </li>
            <li>
              Bạn chịu trách nhiệm về tính chính xác và trung thực của toàn bộ
              thông tin và tài liệu do mình cung cấp.
            </li>
          </ul>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            3. Quyền sở hữu trí tuệ và Hành vi bị cấm
          </h2>
          <p>Bạn cam kết:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Không tải lên các tệp tin chứa virus, mã độc hoặc tệp tin giả mạo
              nhằm phá hoại hệ thống.
            </li>
            <li>
              Không mạo danh bất kỳ cá nhân hoặc tổ chức nào khi đăng ký và sử
              dụng dịch vụ.
            </li>
            <li>
              Nội dung CV tải lên phải thuộc quyền sở hữu hoặc quyền sử dụng hợp
              pháp của chính bạn.
            </li>
          </ul>
          <h2 className="text-xl font-bold text-slate-900 pt-4">
            4. Giới hạn trách nhiệm
          </h2>
          <p>
            FUSE là nền tảng cầu nối hỗ trợ phân tích và gợi ý việc làm thông
            qua AI. Chúng tôi không đảm bảo bạn sẽ chắc chắn trúng tuyển và
            không chịu trách nhiệm pháp lý trực tiếp về các tranh chấp phát sinh
            giữa bạn và Nhà tuyển dụng trong quá trình làm việc sau này.
          </p>
          <p className="pt-6 border-t border-slate-100 text-slate-500 text-xs sm:text-sm">
            Cập nhật lần cuối: Tháng 6 năm 2026.
          </p>
        </div>
      </div>
    </section>
  );
}
