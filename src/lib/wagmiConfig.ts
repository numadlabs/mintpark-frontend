// /lib/wagmiConfig.ts
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import {
  citreaTestnet,
  eduChain,
  hemi,
  mainnet,
  sepolia,
  somniaTestnet,
} from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, eduChain, citreaTestnet, hemi, somniaTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [eduChain.id]: http(),
    [citreaTestnet.id]: http(),
    [hemi.id]: http(),
    [somniaTestnet.id]: http(),
  },
  connectors: [injected()],
  ssr: true,
});
