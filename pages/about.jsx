import React from "react";

const About = () => {
  return (
    <div className="px-4 py-12 mx-auto max-w-screen-xl">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-700 mb-4">
          Welcome to our crowdfunding platform. We are dedicated to helping creators and innovators
          bring their ideas to life through community support.
        </p>
        <p className="text-gray-700">
          Our platform leverages blockchain technology to ensure transparency and security
          in every crowdfunding campaign.
        </p>
      </div>
    </div>
  );
};

export default About; 