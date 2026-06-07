import { INFOMATION_WEB } from "@/shared/constants/constants/infomation-web";

export function RecruiterFooter() {
  return (
    <footer className="bg-muted border-t border-t-gray-300">
      <div className="w-full border-t border-border px-4 py-4 text-center text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
        &copy; {INFOMATION_WEB.COPYRIGHT_YEAR}{" "}
        <span className="uppercase">{INFOMATION_WEB.COMPANY_NAME}</span>. Kiến
        tạo sự nghiệp bền vững.
      </div>
    </footer>
  );
}
