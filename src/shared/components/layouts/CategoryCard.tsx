import Link from "next/link";

interface CategoryCardProps {
  icon: string;
  label: string;
  href?: string;
}

export function CategoryCard({
  icon,
  label,
  href = "/jobs",
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center text-foreground transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
    >
      <span className="mb-4 text-4xl transition-transform group-hover:scale-110">
        {icon}
      </span>
      <p className="font-bold">{label}</p>
    </Link>
  );
}
