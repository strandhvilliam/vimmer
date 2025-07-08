"use client";
import dynamic from "next/dynamic";

const ImageGrid = dynamic(() => import("../../../../components/image-grid"), {
  ssr: false,
});

interface AdminAuthLayoutProps {
  children: React.ReactNode;
}

export default function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-black relative overflow-hidden">
      <div className="absolute z-0 inset-0 pointer-events-none opacity-70 dark:opacity-0 bg-dot-pattern-light" />
      <div className="absolute z-0 inset-0 opacity-0 dark:opacity-70 pointer-events-none bg-dot-pattern-dark" />
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 relative z-10">
        {children}
      </div>
      <div className="hidden md:block w-1/2 relative bg-gray-100 dark:bg-gray-800">
        <ImageGrid />
      </div>
    </div>
  );
}
