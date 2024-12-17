import { AppKitOptions, createAppKit } from '@reown/appkit/react';
import { AppKitNetwork } from '@reown/appkit/networks';

type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>;

export const ganache: AppKitNetwork = {
  id: 1337,
  name: 'Ganache',
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

type ExtendedCreateAppKit = Omit<CreateAppKit, 'networks'> & {
  networks: [AppKitNetwork, ...AppKitNetwork[]];
};

export function createExtendedAppKit(options: ExtendedCreateAppKit) {
  if (!options.networks.some(network => network.id === ganache.id)) {
    options.networks.push(ganache);
  }

  return createAppKit(options);
}