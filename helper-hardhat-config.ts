// 从下到上的结构嵌套关系

import { ethers } from "ethers"

// --------------------- networkConfig ---------------------
export interface networkConfigItem {
    ethUsdPriceFeed?: string
    blockConfirmations?: number
    vrfCoordinatorV2?: string
    entranceFee: bigint
    gasLane: string
    subscriptionId?: string
    callbackGasLimit: string
    interval: string
    mintFee: string
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    localhost: {
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be",
        callbackGasLimit: "500000",
        interval: "30",
        blockConfirmations: 1,
        mintFee: "10000000000000000", // 0.01 ETH
    },
    hardhat: {
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be",
        callbackGasLimit: "500000",
        interval: "30",
        blockConfirmations: 1,
        mintFee: "10000000000000000", // 0.01 ETH
    },
    // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
    // Default one is ETH/USD contract on Sepolia
    arbitrumSepolia: {
        ethUsdPriceFeed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
        blockConfirmations: 1,
        vrfCoordinatorV2: "0x5ce8d5a2bc84beb22a398cca51996f7930313d61",
        entranceFee: ethers.parseEther("0.0001"),
        gasLane: "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be",
        subscriptionId:
            "85737409964455882973977949974983310874029685366348483319434282058601949670808",
        callbackGasLimit: "500000",
        mintFee: "100000000000000", // 0.0001 ETH
        interval: "30",
    },
    polygonSepolia: {
        ethUsdPriceFeed: "0xF0d50568e3A7e8259E16663972b11910F89BD8e7",
        blockConfirmations: 1,
        vrfCoordinatorV2: "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2",
        entranceFee: ethers.parseEther("0.0001"),
        gasLane: "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be",
        subscriptionId:
            "85737409964455882973977949974983310874029685366348483319434282058601949670808",
        callbackGasLimit: "500000",
        mintFee: "100000000000000", // 0.0001 ETH
        interval: "30",
    },
}
// --------------------- networkConfig ---------------------

// --------------------- developmentChains ---------------------
export const developmentChains = ["hardhat", "localhost"]
// --------------------- developmentChains ---------------------
