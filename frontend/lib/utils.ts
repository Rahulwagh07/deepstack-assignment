import { AuctionData, AuctionFormData, AuctionState, Bid } from "@/types/auction"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatAddress = (addr: string) => {
  const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2)
  return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(39)}`
}

export const formatEth = (value: bigint) => {
  return Number(value) / 1e18;
};

export const validateForm = (
  formData: AuctionFormData,
  setFormErrors: React.Dispatch<
    React.SetStateAction<Partial<Record<keyof AuctionFormData, string>>>
  >
): boolean => {
  const errors: Partial<Record<keyof AuctionFormData, string>> = {};

  if (formData.name.trim().length < 3) {
    errors.name = "Auction name must be at least 3 characters.";
  }
  if (isNaN(parseFloat(formData.maxBid)) || parseFloat(formData.maxBid) <= 0) {
    errors.maxBid = "Max bid must be greater than 0.";
  }
  if (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) < 1) {
    errors.duration = "Duration must be at least 1 minute.";
  }

  setFormErrors(errors);

  return Object.keys(errors).length === 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseAuctionData(data: any[]): AuctionData {
  return {
    name: data[0],
    creator: data[1] as `0x${string}`,
    maxBid: BigInt(data[2]),
    numberOfWinners: Number(data[3]),
    startTime: BigInt(data[4]),
    endTime: BigInt(data[5]),
    lockedFunds: BigInt(data[6]),
    currentState: parseAuctionState(Number(data[7])),
    winners: (data[8] || []).map((bid: Bid) => ({
      bidder: bid.bidder,
      amount: BigInt(bid.amount),
      timestamp: BigInt(bid.timestamp)
    })),
    bids: (data[9] || []).map((bid: Bid) => ({
      bidder: bid.bidder,
      amount: BigInt(bid.amount),
      timestamp: BigInt(bid.timestamp)
    }))
  };
}

function parseAuctionState(state: number): AuctionState {
  const states: Record<number, AuctionState> = {
    0: 'ACTIVE',
    1: 'COMPLETED',
    2: 'CANCELLED'
  };
  return states[state] || 'ACTIVE';
}

