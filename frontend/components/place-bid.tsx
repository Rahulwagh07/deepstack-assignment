"use client";

import { useState} from "react";
import { useWriteContract, useTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ABI2 } from "@/lib/constant";
import toast from "react-hot-toast";
import WalletButton from "./wallet-connect-button";
import { formatEth } from "@/lib/utils";

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxBidAmount?: bigint;
  contractAddress: string;
}

export function PlaceBidModal({
  isOpen,
  onClose,
  maxBidAmount,
  contractAddress,
}: PlaceBidModalProps) {
  const [bidAmount, setBidAmount] = useState("");
  const {
    writeContractAsync,
    isPending: isPlacingBid,
    data: hash,
  } = useWriteContract();
  const { isLoading: isConfirming} =
    useTransactionReceipt({ hash });
  const { isConnected } = useAccount();

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const valueInWei = parseEther(bidAmount);
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: ABI2,
        functionName: "placeBid",
        args: [valueInWei],
      });
      toast.success("Bid placed successfully");
      onClose();
    } catch (error) {
      console.log("Error placing bid:", error);
      toast.error("Failed to place bid");
    }
  };
 
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
        </DialogHeader>
        <form onSubmit={handlePlaceBid}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="bid-amount" className="text-right">
                Bid Amount (ETH)
              </label>
              <Input
                id="bid-amount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                className="col-span-3"
                min="0"
                max={maxBidAmount ? formatEth(maxBidAmount) : undefined}
                step="0.0001"
                required
              />
            </div>
          </div>
          <DialogFooter>
            {isConnected ? (
              <Button type="submit" disabled={isPlacingBid || isConfirming}>
                {isPlacingBid
                  ? "Placing Bid..."
                  : isConfirming
                  ? "Confirming..."
                  : "Place Bid"}
              </Button>
            ) : (
              <WalletButton />
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
