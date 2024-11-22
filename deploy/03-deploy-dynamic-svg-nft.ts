import { DeployFunction } from "hardhat-deploy/dist/types"
import verify from "../utils/verify"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { getNamedAccounts, ethers } from "hardhat"
import fs from "fs"

const deployDynamicSvgNft: DeployFunction = async (hre) => {
	const { network, deployments } = hre
	const { deploy, log } = deployments
	const namedAccounts = await getNamedAccounts()
	const deployer = namedAccounts.deployer

	let ethUsdPriceFeedAddress
	if (developmentChains.includes(network.name)) {
		const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
		ethUsdPriceFeedAddress = await EthUsdAggregator.getAddress()
	} else {
		ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed
	}

	const lowSvg = await fs.readFileSync("./images/dynamicNft/frown.svg", {encoding: "utf8"})
	const highSvg = await fs.readFileSync("./images/dynamicNft/happy.svg", { encoding: "utf8" })
	const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]
	const dynamicSvgNft = await deploy("DynamicSvgNft", {
		from: deployer,
		log: true,
		args: args,
		waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
	})

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		log("Verifying...")
		await verify(dynamicSvgNft.address, args)
	}
}

export default deployDynamicSvgNft
deployDynamicSvgNft.tags = ["all", "main", "dynamicsvg"]