export interface AuctionData {
  name: string;
  creator: `0x${string}`;
  maxBid: bigint;
  numberOfWinners: number;
  startTime: bigint;
  endTime: bigint;
  lockedFunds: bigint;
  currentState: AuctionState;
  winners: Bid[];
  bids: Bid[];
}

export interface Bid {
  bidder: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
}

export type AuctionState = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface AuctionFormData {
  name: string;
  maxBid: string;
  numberOfWinners: string;
  duration: string;
}