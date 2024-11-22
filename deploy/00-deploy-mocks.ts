import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const _BASEFEE = "1000000000000000"
const _GASPRICELINK = "1000000000"
const _WEIPERUNITLINK = "4419370177037260"

const _DECIMALS = 18
const _INITIAL_PRICE = ethers.parseUnits("2000", _DECIMALS)

/*
	mock流程：
	1. contract/test 先有一个mock合约
	2. deploy文件中deploy它
	3. createSubscription
	4. fundSubscription
*/

const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [_BASEFEE, _GASPRICELINK, _WEIPERUNITLINK]

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks ...")
        // deploy a mock vrfcoordinator
        await deploy("VRFCoordinatorV2_5Mock", {
            from: deployer,
            log: true,
            args: args,
		})
		await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [_DECIMALS, _INITIAL_PRICE],
        })
        log("Mocks Deployed!")
        log("---------------------------------------------------------")
    }
}

export default deployMocks
deployMocks.tags = ["all", "mocks", "main"]
