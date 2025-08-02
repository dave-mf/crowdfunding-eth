import React from "react";

const aboutCards = [
  {
    icon: "🌐",
    title: "What is this platform?",
    desc: "Our platform is a place where anyone can support creative projects, social causes, or innovative ideas. Unlike traditional crowdfunding, we use blockchain technology to make sure every donation is secure, traceable, and open for everyone to see."
  },
  {
    icon: "🔗",
    title: "Why Blockchain?",
    desc: (
      <>
        Blockchain is like a digital ledger that records every transaction. It’s public, tamper-proof, and doesn’t rely on a single company or bank. This means:
        <ul className="list-disc pl-5 mt-2 text-left text-sm text-gray-500">
          <li><b>Transparency:</b> You can see exactly where your money goes.</li>
          <li><b>Security:</b> Your donations are protected by advanced cryptography.</li>
          <li><b>No Middlemen:</b> Funds go directly to the project creators.</li>
        </ul>
      </>
    )
  },
  {
    icon: "🚀",
    title: "How does it work?",
    desc: (
      <ol className="list-decimal pl-5 mt-2 text-left text-sm text-gray-500">
        <li><b>Discover Projects:</b> Browse campaigns from creators around the world.</li>
        <li><b>Donate Easily:</b> Support projects using cryptocurrency (like Ethereum) with just a few clicks.</li>
        <li><b>Track Progress:</b> Watch how your contribution helps projects grow, with all transactions visible on the blockchain.</li>
      </ol>
    )
  },
  {
    icon: "🤝",
    title: "Who is it for?",
    desc: (
      <>
        <b>Supporters:</b> Anyone who wants to make a difference and see their impact.<br />
        <b>Creators:</b> Innovators, artists, and changemakers looking for transparent funding.
      </>
    )
  },
  {
    icon: "💡",
    title: "Our Mission",
    desc: "We believe in the power of community. By combining crowdfunding with blockchain, we’re building a platform that’s open, fair, and empowering for everyone—no technical knowledge required."
  }
];

const About = () => {
  return (
    <div className="w-full px-4 md:px-12 lg:px-32 py-12 bg-white min-h-screen">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 0C7.582 4 4 7.582 4 12c0 4.418 3.582 8 8 8s8-3.582 8-8c0-4.418-3.582-8-8-8z" /></svg>
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">About Our Crowdfunding Platform</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">Welcome to a new era of crowdfunding—where trust, transparency, and community come first.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {aboutCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow border border-gray-100 p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
            <span className="text-4xl mb-4">{card.icon}</span>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{card.title}</h3>
            <div className="text-gray-600 text-base">{card.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <span className="inline-block bg-blue-100 text-blue-800 text-base font-semibold px-6 py-3 rounded-full shadow">Ready to join? Explore, support, and be part of a caring community that’s shaping the future—one project at a time.</span>
      </div>
    </div>
  );
};

export default About; 