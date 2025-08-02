import React, { useState } from "react";

const Hero = ({ createCampaign }) => {
  const [campaign, setCampaign] = useState({
    title: "",
    description: "",
    amount: "",
    deadline: "",
  });

  const createNewCampaign = async (e) => {
    e.preventDefault();
    try {
      await createCampaign(campaign);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="relative min-h-[94vh] flex items-center justify-center px-4 py-16 md:py-0 bg-gradient-to-b from-[#252525] to-[#181717]">
      <div className="max-w-6xl w-full text-center">
        {/* Badge Trusted Platforms */}
        <div className="inline-flex items-center px-5 py-2 border border-white rounded-full mb-12">
          <span className="text-white font-medium text-base">Trusted Platforms</span>
          <span className="ml-2 text-white text-lg font-bold">©</span>
        </div>
        <h1 className="text-white text-4xl md:text-5xl font-medium mb-6">
          Support Projects, Join a Caring Community
        </h1>
        <p className="text-gray-400 text-md md:text-xl font-light mb-16">
          With the power of community support, your vision can become a reality.
          <br />
          Let's collaborate and make a positive impact together!
        </p>

        {/* FORM SECTION */}
        <form
          onSubmit={createNewCampaign}
          className="bg-white rounded-xl shadow-xl px-6 py-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center max-w-6xl mx-auto"
        >
          <div className="flex flex-col items-start col-span-1">
            <label className="text-sm font-semibold text-gray-600 mb-1">Title</label>
            <input
              type="text"
              placeholder="Campaign Title"
              className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col items-start col-span-1">
            <label className="text-sm font-semibold text-gray-600 mb-1">Description</label>
            <input
              type="text"
              placeholder="Description"
              className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col items-start col-span-1">
            <label className="text-sm font-semibold text-gray-600 mb-1">Target Amount (ETH)</label>
            <input
              type="text"
              placeholder="Target"
              className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              onChange={(e) => setCampaign({ ...campaign, amount: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col items-start col-span-1">
            <label className="text-sm font-semibold text-gray-600 mb-1">Deadline</label>
            <input
              type="date"
              className="w-full bg-transparent border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              onChange={(e) => setCampaign({ ...campaign, deadline: e.target.value })}
              required
            />
          </div>

          <div className="col-span-1 flex items-end h-full">
            <button
              type="submit"
              className="w-full bg-neutral-900 text-white px-4 py-3 rounded-md font-regular text-sm hover:bg-neutral-800 transition">
              Create Campaign →
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;
