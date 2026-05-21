// This layout intentionally bypasses the kasir layout (sidebar + header)
// so the print page renders as a clean, standalone document.
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
