import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
      <Sidebar />
      <main
        className="flex-1 p-4 md:p-8 overflow-y-auto pt-16 md:pt-8"
        role="main"
        aria-label="Page content"
      >
        {children}
      </main>
    </div>
  );
}
