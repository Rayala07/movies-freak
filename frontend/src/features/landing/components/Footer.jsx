const Footer = () => {
  return (
    <footer className="py-12 border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Powered by TMDB. AI-driven personalized movie discovery.
        </p>
        <p className="text-[var(--text-muted)] text-xs">
          Built with love towards cinema by Rayala Viswanath
        </p>
      </div>
    </footer>
  );
};

export default Footer;
