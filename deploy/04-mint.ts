import { ethers, network, getNamedAccounts } from "hardhat"
import { BasicNFT, DynamicSvgNft, RandomIpfsNft, VRFCoordinatorV2_5Mock } from "../typechain-types"
import { developmentChains } from "../helper-hardhat-config"
import { DeployFunction } from "hardhat-deploy/types"

const mintDeploy: DeployFunction = async function () {
    const deployer = (await getNamedAccounts()).deployer

    // Basic NFT
    const basicNft: BasicNFT = await ethers.getContract("BasicNFT", deployer)
    const tx = await basicNft.mintNft()
    await tx.wait(1)
    console.log(`basic nft index 0 has tokenURI: ${await basicNft.tokenURI(0)}`)

    // random IPFS NFT
    const randomIpfsNft: RandomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()

    await new Promise<void>(async (resolve, reject) => {
        setTimeout(resolve, 300000) // 5 minutes
        randomIpfsNft.once(randomIpfsNft.filters.NftMinted, async () => {
            resolve()
        })
        const randomTx = await randomIpfsNft.requestNft({ value: mintFee.toString() })
        const randomTxReceipt = await randomTx.wait()
        if (developmentChains.includes(network.name)) {
            const requestId = randomTxReceipt!.logs[1].topics[1]
            const vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock = await ethers.getContract(
                "VRFCoordinatorV2_5Mock",
                deployer
            )
            await vrfCoordinatorV2_5Mock.fulfillRandomWords(
                requestId,
                await randomIpfsNft.getAddress()
            )
        }
    })
    console.log(`random nft index 0 has tokenURI: ${await randomIpfsNft.tokenURI(0)}`)

    // dynamic svg nft
    const highValue = ethers.parseEther("4000")
    const dynamicSvgNft: DynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicTx.wait(1)
    console.log(`dynamic nft index 0 has tokenURI: ${await dynamicSvgNft.tokenURI(0)}`)
}

export default mintDeploy
mintDeploy.tags = ["all", "mint"]