import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "hardhat-deploy"
import "hardhat-deploy-ethers"
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-toolbox"
import "dotenv/config"
import "solidity-coverage"

const INFURA_ARBI_SEPOLIA_RPC_URL = process.env.INFURA_ARBI_SEPOLIA_RPC_URL
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY
const POLYGON_SEPOLIA_RPC_URL = process.env.POLYGON_SEPOLIA_RPC_URL
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKET_API = process.env.COINMARKET_API
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    solidity: { compilers: [{ version: "0.8.21" }, { version: "0.6.12" }] },
    // 给账户命名
    namedAccounts: {
        // 名称
        deployer: {
            default: 0, // 第0个账户
            // 31337: 1, // chainId为31337 的第一个账户
        },
        player: {
            default: 1,
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts: hardhat prepare already
            chainId: 31337,
        },
        arbitrumSepolia: {
            url: INFURA_ARBI_SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY!],
            chainId: 421614,
        },
        polygonSepolia: {
            url: POLYGON_SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY!],
            chainId: 80002,
        },
    },
    etherscan: {
        apiKey: {
            arbitrumSepolia: ETHERSCAN_API_KEY!,
            polygonSepolia: POLYGONSCAN_API_KEY!,
        },
    },
    // yarn add --dev hardhat-gas-reporter
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        L2: "arbitrum",
        currency: "USD",
        coinmarketcap: COINMARKET_API,
        L2Etherscan: ARBISCAN_API_KEY,
        // 要申请api https://coinmarketcap.com/ 并且有外网
    },
    mocha: {
        timeout: 200000, // 200seconds
    },
}

export default config
