import React, { useContext, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { MultiContractContext } from "../Context/MultiContractContext";
import Link from "next/link";

const NavBar = () => {
  const { currentAccount, connectWallet, disconnectWallet } = useContext(MultiContractContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuList = [
    { name: "Optimalisasi Variabel", path: "/variable-packing" },
    { name: "Penggabungan Transaksi", path: "/batch-processing" },
    { name: "About", path: "/about" },
    { name: "Statistik Gasfee", path: "/gas-stats" }
  ];

  return (
    <nav className="bg-nav-dark text-white py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Left side - Logo/Toggle */}
          <div className="flex items-center space-x-4">
            <button 
              className="lg:hidden text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="text-xl font-semibold">
              CRFund
            </Link>
          </div>

          {/* Center/Right - Navigation Links AND Wallet Info (Desktop) */}
          <div className="hidden lg:flex space-x-8 items-center">
            {menuList.map((item, index) => {
              const isActive = router.pathname === item.path;
              return (
                <Link 
                  key={index} 
                  href={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-black text-white" : "text-gray-300 hover:text-white hover:bg-black"}`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Dropdown untuk Optimized dan Original */}
            <div
              ref={dropdownRef}
              className="relative"
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-black focus:outline-none"
              >
                Lainnya
              </button>
              <div 
                className={`${isDropdownOpen ? 'block' : 'hidden'} absolute right-0 top-[calc(100%+8px)] w-48 bg-black rounded-md shadow-lg py-1 z-20`}
              >
                <Link
                  href="/"
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Optimized
                </Link>
                <Link
                  href="/original"
                  className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Original
                </Link>
              </div>
            </div>
            
            {/* Wallet Info and Button - Dipindah ke sini */}
            {!currentAccount ? (
              <button
                onClick={connectWallet}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="text-sm">
                  {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-16 left-0 right-0 bg-black z-50">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {/* Dropdown di mobile menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Lainnya
                  </button>
                  <div className={`${isDropdownOpen ? 'block' : 'hidden'} mt-1 bg-gray-800 rounded-md shadow-lg py-1`}>
                    <Link
                      href="/"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Optimized
                    </Link>
                    <Link
                      href="/original"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Original
                    </Link>
                  </div>
                </div>

                {menuList.map((item, index) => {
                  const isActive = router.pathname === item.path;
                  return (
                    <Link
                      key={index}
                      href={item.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${isActive ? "bg-gray-500 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
                {/* Opsi connect/disconnect di mobile menu */}
                {!currentAccount ? (
                  <button
                    onClick={connectWallet}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-gray-300">
                      {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
                    </div>
                  <button
                    onClick={disconnectWallet}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Disconnect
                  </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;