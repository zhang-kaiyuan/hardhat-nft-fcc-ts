import { DeployFunction } from "hardhat-deploy/dist/types"
import verify from "../utils/verify"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { getNamedAccounts } from "hardhat"

const deployBasicNft: DeployFunction = async (hre) => {
    const { network, deployments } = hre
    const { deploy, log } = deployments
    const namedAccounts = await getNamedAccounts()
    const deployer = namedAccounts.deployer

    log("--------------------------------------------------------")
    const args: any[] = []
    const basicNft = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(basicNft.address, args)
    }
    log("--------------------------------------------------------")
}

export default deployBasicNft
deployBasicNft.tags = ["all", "basicnft", "main"]
