"use client";

import { useReadContract } from "wagmi";
import { AuctionCard } from "./auction-card";
import { ABI, CONTRACT_ADDRESS } from "@/lib/constant";
import { useEffect, useState } from "react";

export function AuctionDisplay({ refetchFlag }: { refetchFlag: boolean }) {
  const [auctions, setAuctions] = useState<`0x${string}`[]>([]);
  const { data, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAllAuctions",
  });

  useEffect(() => {
    if (data) {
      setAuctions(data as `0x${string}`[]);
    }
  }, [data]);

  useEffect(() => {
    if (refetchFlag) {
      refetch();
    }
  }, [refetchFlag, refetch]);

  if (isLoading)
    return (
      <div className="text-center py-8 text-white/80">Loading auctions...</div>
    );
  if (error) {
    console.log("Error getting auctions", error);
    return (
      <div className="text-center py-8 text-white/80">
        Error loading auctions
      </div>
    );
  }

  return (
    <div className="py-8">
      {auctions?.length === 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-12 text-center text-white/80">
            No auctions Found
          </h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {auctions?.map((auctionAddress) => (
            <AuctionCard key={auctionAddress} address={auctionAddress} />
          ))}
        </div>
      )}
    </div>
  );
}
