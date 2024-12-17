"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ABI2 } from "@/lib/constant";
import { PlaceBidModal } from "./place-bid";
import toast from "react-hot-toast";
import { AuctionData } from "@/types/auction";
import { formatEth, parseAuctionData } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AuctionCard({ address }: { address: `0x${string}` }) {
  const { address: connectedAddress } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [auctionData, setAuctionData] = useState<AuctionData | undefined>();
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [isCurrentUserCreator, setIsCurrentUserCreator] = useState(false);
  const { data: balance } = useBalance({ address });

  const { data, isLoading, error, refetch } = useReadContract({
    address,
    abi: ABI2,
    functionName: "getAuctionDetails",
    args: [],
  });

  const { writeContractAsync, isPending } = useWriteContract();

  useEffect(() => {
    if (data && Array.isArray(data)) {
      try {
        const parsedData = parseAuctionData(data);
        setAuctionData(parsedData);
        setIsCurrentUserCreator(
          connectedAddress?.toLowerCase() === parsedData.creator.toLowerCase()
        );
        setIsAuctionEnded(parsedData.currentState !== "ACTIVE");
      } catch (err) {
        console.error("Error parsing auction data:", err);
        toast.error("Error parsing auction data");
      }
    }
  }, [data, connectedAddress]);

  if (isLoading) return <></>;

  if (error) {
    return (
      <Card className="h-48 flex items-center justify-center text-red-500">
        Error loading auction details
      </Card>
    );
  }

  if (!auctionData) {
    return (
      <Card className="h-48 flex items-center justify-center">
        No details found for the auction
      </Card>
    );
  }

  const handleEndAuction = async () => {
    try {
      await writeContractAsync({
        address,
        abi: ABI2,
        functionName: "declareWinners",
        args: [],
      });
      toast.success("Auction Ended Successfully");
      refetch();
    } catch (error) {
      console.log("Failed to end auction", error);
      toast.error("Failed to end auction");
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:scale-[1.02] bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="bg-white/5">
        <CardTitle className="text-lg font-semibold truncate text-white">
          {auctionData.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <p className="text-sm text-white/80">
            <span className="font-medium text-white">Creator:</span>{" "}
            {auctionData.creator}
          </p>
          <p className="text-sm text-white/80 flex gap-1 items-center">
            <span className="font-medium text-white">Contract Address:</span>{" "}
            {address}
            <Link
              href={`https://sepolia.etherscan.io/address/${address}`}
              target="_blank"
              className="font-medium text-white"
            >
              <ExternalLink size={16} className="text-blue-400 " />
            </Link>
          </p>
          <p
            className={`text-sm text-white/80 ${
              isAuctionEnded ? "hidden" : "block"
            }`}
          >
            <span className="font-medium text-white">Fund Locked:</span>{" "}
            {balance?.formatted} ETH
          </p>
          <p className="text-sm text-white/80">
            <span className="font-medium text-white">Max Bid:</span>{" "}
            {formatEth(auctionData.maxBid)} ETH
          </p>
          <p className="text-sm text-white/80">
            <span className="font-medium text-white">Winners:</span>{" "}
            {auctionData.numberOfWinners}
          </p>
          <p className="text-sm text-white/80">
            <span className="font-medium text-white">Start Time:</span>{" "}
            {new Date(Number(auctionData.startTime) * 1000).toLocaleString()}
          </p>
          <p className="text-sm text-white/80">
            <span className="font-medium text-white">End Time:</span>{" "}
            {new Date(Number(auctionData.endTime) * 1000).toLocaleString()}
          </p>
          <p className="text-sm text-white/80">
            <span className="font-medium text-white">State:</span>{" "}
            {auctionData.currentState}
          </p>

          {isAuctionEnded && auctionData.winners.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-white">Winners:</h3>
              {auctionData.winners.map((winner, index) => (
                <div key={index} className="text-sm text-white/80">
                  <p>
                    Winner {index + 1}: {winner.bidder}
                  </p>
                  <p>Bid Amount: {formatEth(winner.amount)} ETH</p>
                </div>
              ))}
            </div>
          )}

          {isAuctionEnded && auctionData.bids.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-white">All Bids:</h3>
              {auctionData.bids.map((bid, index) => (
                <div key={index} className="text-sm text-white/80">
                  <p>
                    Bid {index + 1}: {bid.bidder}
                  </p>
                  <p>Bid Amount: {formatEth(bid.amount)} ETH</p>
                </div>
              ))}
            </div>
          )}

          {!isAuctionEnded && isCurrentUserCreator ? (
            <Button
              onClick={handleEndAuction}
              disabled={isPending}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isPending ? "Ending Auction..." : "End Auction"}
            </Button>
          ) : !isAuctionEnded ? (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Place Bid
            </Button>
          ) : null}
        </div>
      </CardContent>
      <PlaceBidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxBidAmount={auctionData.maxBid}
        contractAddress={address}
      />
    </Card>
  );
}
