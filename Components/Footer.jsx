import React from "react";

const Footer = () => {
  return (
    <footer className="text-white bg-neutral-900 py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Deskripsi Project */}
        <div className="text-left">
          <h6 className="mb-4 font-semibold uppercase">Crowdfunding</h6>
          <p>
            Crowdfunding platform for supporting projects transparently and efficiently on blockchain. Join, donate, and make an impact!
          </p>
        </div>
        {/* Link Navigasi */}
        <div className="text-left md:pl-12">
          <h6 className="mb-4 font-semibold uppercase">Navigation</h6>
          <ul className="space-y-2">
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/gas-stats" className="hover:underline">Statistik Gasfee</a></li>
            <li><a href="/" className="hover:underline">Optimized</a></li>
            <li><a href="/original" className="hover:underline">Original</a></li>
            <li><a href="/variable-packing" className="hover:underline">Optimalisasi Variabel</a></li>
            <li><a href="/batch-processing" className="hover:underline">Penggabungan Transaksi</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-400 text-sm">
        &copy; 2025 Crowdfunding. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
