/**
 * PageHeader
 * Renders the standard page title row used by every page.
 *
 * <PageHeader title="Students" subtitle="42 of 120 students">
 *   <PrimaryButton>+ Add</PrimaryButton>  
 * </PageHeader>
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{title}</h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
