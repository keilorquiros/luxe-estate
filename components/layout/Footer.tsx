interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer
      className={`mt-auto border-t border-gray-200 bg-white ${className}`}
    >
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-400">
          © 2026{' '}
          <span className="font-medium text-gray-500">Luxe Estate</span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
