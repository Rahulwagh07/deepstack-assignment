"use client";

import React from "react";
import { Button } from "./ui/button";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import { formatAddress } from "@/lib/utils";
import { useBalance } from "wagmi";

export default function WalletButton() {
  const { open } = useAppKit();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const { data: balanceData } = useBalance({
    address: address,
  });

  const balance = balanceData?.formatted;

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      open();
    }
  };

  return (
    <div className="flex">
      <Button className="bg-pink-500 hover:bg-pink-600" onClick={handleClick}>
        {isConnected ? (
          <span>
            {formatAddress(address!)} -{" "}
            <span className="text-black-500">{balance?.slice(0, 7)}</span>
          </span>
        ) : (
          "Connect Wallet"
        )}
      </Button>
    </div>
  );
}
