import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader"; // Đường dẫn không đổi nhưng file đã được chuyển

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100/90">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden bg-gray-100/90 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
