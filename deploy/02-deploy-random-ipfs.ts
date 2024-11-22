import { getNamedAccounts, ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"
import verify from "../utils/verify"
import { VRFCoordinatorV2_5Mock } from "../typechain-types"
import { pinataUtils } from "../utils/pinataUtils"

const imagesLocation = "./images/randomNft"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: 100,
        },
    ],
}

let tokenUris = [
    "ipfs://bafkreidwgbvd4cph5vjmyfjjkmgnom7nz7b6ues5cmtovclcks7dfsfiai",
    "ipfs://bafkreibdusqeb5o34gkadkroavftgjfekiuju77yaadaykacmh3q2xtx7u",
    "ipfs://bafkreib7vnqdrfs3pzz64w5vale65vkeubygpibpxh5ni7zeekb2kfg6xy",
]

const FUND_AMOUT = ethers.parseEther("1")

const deployRandomIpfs: DeployFunction = async (hre) => {
    const { deployments, network } = hre
    const { deploy, log } = deployments
    const accounts = await getNamedAccounts()
    const deployer = accounts.deployer

    // init coordinator and subcriptionId based on diffrent network environment
    let vrfCoordinatorV2_5Address, subscriptionId, vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock
    if (developmentChains.includes(network.name)) {
        vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")
        vrfCoordinatorV2_5Address = await vrfCoordinatorV2_5Mock.getAddress()
        const tx = await vrfCoordinatorV2_5Mock.createSubscription()
        const receipt = await tx.wait()
        subscriptionId = receipt!.logs[0].topics[1]
    } else {
        vrfCoordinatorV2_5Address = networkConfig[network.name].vrfCoordinatorV2
        subscriptionId = networkConfig[network.name].subscriptionId!
    }

    // get ipfs hash of our images
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUris()
    }

    // 3种方式使用ipfs
    // 1. 自己创建节点
    // 2. pinata 方便 高级功能付费
    // 3. nft.storage 保存最久

    console.log("----------------------------------------")

    // deploy RandomIpfsNft
    const args: any[] = [
        vrfCoordinatorV2_5Address,
        subscriptionId,
        networkConfig[network.name].gasLane,
        networkConfig[network.name].callbackGasLimit,
        tokenUris,
        networkConfig[network.name].mintFee,
    ]
    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations,
    })

    console.log("----------------------------------------")

    // verify and handle the mock
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNft.address, args) // args 与contract相同
    } else {
        // 消费者添加到订阅中 subscribe
        await vrfCoordinatorV2_5Mock!.addConsumer(subscriptionId, randomIpfsNft.address)
        // 充值 deposit
        await vrfCoordinatorV2_5Mock!.fundSubscription(subscriptionId, FUND_AMOUT)
    }
}

async function handleTokenUris() {
    const tokenUris: string[] = []
    // store the Image in IPFS
    // store the metadata in IPFS
    const { responses, files } = await pinataUtils.storeImages(imagesLocation)
    for (const index in responses) {
        // create metadata
        // upload metadata
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[index].replace(".png", "")
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${responses[index].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        // store the JSON to pinata / IPFS
        const response = await pinataUtils.storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${response?.IpfsHash}`)
    }
    console.log("Token URIs Uploaded! They are:")
    console.log(tokenUris)
    return tokenUris
}

export default deployRandomIpfs
deployRandomIpfs.tags = ["all", "randomIpfs", "main"]
