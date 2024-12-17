"use client";

import { wagmiAdapter, projectId } from "../wagmi/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hardhat, sepolia } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { State, WagmiProvider, type Config } from "wagmi";
import { createExtendedAppKit, ganache } from "@/wagmi/appkit-extension";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

createExtendedAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia, ganache, hardhat],
  defaultNetwork: sepolia,
  features: {
    analytics: true,
  },
});

interface ProvidersProps {
  children: ReactNode;
  initialState?: State;
}

function Providers({ children, initialState }: ProvidersProps) {
  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;
