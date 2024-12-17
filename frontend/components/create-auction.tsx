"use client";

import React, { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { ABI, CONTRACT_ADDRESS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import WalletButton from "./wallet-connect-button";
import { AuctionFormData } from "@/types/auction";
import { validateForm } from "@/lib/utils";

export default function CreateAuctionComponent({
  onAuctionCreated,
}: {
  onAuctionCreated: () => void;
}) {
  const { isConnected } = useAccount();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AuctionFormData>({
    name: "",
    maxBid: "",
    numberOfWinners: "",
    duration: "",
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AuctionFormData, string>>
  >({});

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isConnected) {
      toast.error("Wallet not connected");
      setOpen(false);
      return;
    }

    if (!validateForm(formData, setFormErrors)) {
      toast.error("Form validation failed");
      return;
    }

    const totalCost =
      parseFloat(formData.maxBid) * parseInt(formData.numberOfWinners, 10);
    const duration = parseInt(formData.duration, 10) * 60;
    
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "createReverseAuction",
        args: [
          formData.name,
          parseEther(formData.maxBid),
          BigInt(formData.numberOfWinners),
          BigInt(duration),
        ],
        value: parseEther(totalCost.toString()),
      });
      toast.success("Auction Created");
      onClose();
      onAuctionCreated();
    } catch (error) {
      console.log("Transaction Failed:", error);
      toast.error(`Transaction Failed`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      maxBid: "",
      numberOfWinners: "",
      duration: "",
    });
    setFormErrors({});
  };

  const onClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Create New Auction</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Reverse Auction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Auction Name</Label>
            <Input
              id="name"
              placeholder="Enter auction name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxBid">Max Bid (ETH)</Label>
            <Input
              id="maxBid"
              type="number"
              placeholder="Enter max bid amount"
              value={formData.maxBid}
              onChange={(e) => handleInputChange("maxBid", e.target.value)}
              required
            />
            {formErrors.maxBid && (
              <p className="text-sm text-red-500">{formErrors.maxBid}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfWinners">Number of Winners</Label>
            <Input
              id="numberOfWinners"
              type="number"
              placeholder="Enter number of winners"
              value={formData.numberOfWinners}
              onChange={(e) =>
                handleInputChange("numberOfWinners", e.target.value)
              }
              min="1"
              required
            />
            {formErrors.numberOfWinners && (
              <p className="text-sm text-red-500">
                {formErrors.numberOfWinners}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Auction Duration (Minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="Enter auction duration in minutes"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              min="1"
              required
            />
            {formErrors.duration && (
              <p className="text-sm text-red-500">{formErrors.duration}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Reset
            </Button>
            {isConnected ? (
              <Button type="submit" disabled={isPending || isConfirming}>
                {isPending || isConfirming ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            ) : (
              <WalletButton />
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
