"use client";

import { useState } from "react";
import { AuctionDisplay } from "@/components/auction-display";
import CreateAuctionComponent from "@/components/create-auction";
import WalletConnectButton from "@/components/wallet-connect-button";

export default function Home() {
  const [refetchFlag, setRefetchFlag] = useState(false);

  const handleAuctionCreated = () => {
    setRefetchFlag((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-navy-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <div className="flex items-center justify-center gap-4 py-6">
          <CreateAuctionComponent onAuctionCreated={handleAuctionCreated} />
          <WalletConnectButton />
        </div>
        <AuctionDisplay refetchFlag={refetchFlag} />
      </div>
    </div>
  );
}
