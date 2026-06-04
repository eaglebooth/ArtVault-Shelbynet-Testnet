import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-shelby-border/60 bg-shelby-dark py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-sm text-shelby-muted">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-shelby-pink text-white shadow-lg shadow-shelby-pink/40">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="font-bold text-white">ArtVault</span>
          </div>

          <div className="hidden md:block">
            Powered by{" "}
            <a
              href="https://shelby.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-shelby-pink"
            >
              Shelby Protocol
            </a>{" "}
            · Aptos Blockchain
          </div>

          <div>© {new Date().getFullYear()} ArtVault</div>
        </div>
      </div>
    </footer>
  );
}
