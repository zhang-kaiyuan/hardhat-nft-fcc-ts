import { assert, expect } from "chai"
import { networkConfig, developmentChains } from "../../helper-hardhat-config"
import { network, deployments, ethers, getNamedAccounts } from "hardhat"
import { BasicNFT } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Basic NFT Unit Tests", () => {
          let deployer, basicNft: BasicNFT

          beforeEach(async () => {
              const accounts = await getNamedAccounts()
              const deployer = accounts.deployer
              await deployments.fixture("basicnft")
              basicNft = await ethers.getContract("BasicNFT")
          })

          it("Allows users to mint an NFT, and updates appropriately", async () => {
              const txResponse = await basicNft.mintNft()
              await txResponse.wait()
              const tokenURI = await basicNft.tokenURI(0)
              const tokenCounter = await basicNft.getTokenCounter()

              assert.equal(tokenCounter.toString(), "1")
              assert.equal(tokenURI, await basicNft.TOKEN_URI())
          })
      })
