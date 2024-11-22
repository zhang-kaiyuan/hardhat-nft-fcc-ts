import { developmentChains, networkConfig } from "../../helper-hardhat-config"
import { network, ethers, deployments, getNamedAccounts } from "hardhat"
import { RandomIpfsNft, VRFCoordinatorV2_5Mock } from "../../typechain-types"
import { assert, expect } from "chai"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("RandomIpfsNft", function () {
          let randomIpfsNft: RandomIpfsNft, vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock, deployer
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["mocks", "randomIpfs"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
              vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")
          })

          // constructor test
          describe("constructor", function () {
              it("set values correctly", async () => {
                  const init = await randomIpfsNft.getInitialized()
                  const dogTokenUri = await randomIpfsNft.getDogTokenUris(0)
                  assert(dogTokenUri.includes("ipfs://"))
                  assert(init)
              })
          })
          // requestNft
          describe("requestNft", function () {
              it("filed to request nft by value less then mintFee", async () => {
                  await expect(
                      randomIpfsNft.requestNft({ value: ethers.parseEther("0.000000001") })
                  ).to.be.revertedWithCustomError(randomIpfsNft, "RandomIpfsNft__NeedMoreETHSend")
              })
              it("success to request nft", async () => {
                  const mintFee = await randomIpfsNft.getMintFee()
                  await expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })

          // fulfillRandomWords
          describe("fulfillRandomWords", function () {
              it("mint nft after random number retruned", async () => {
                  await new Promise(async (resolve, reject) => {
                      // 监听随机数返回事件
                      randomIpfsNft.once(randomIpfsNft.filters.NftMinted, async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI(0)
                              assert(tokenUri.includes("ipfs://"))
                              const tokenCounter = await randomIpfsNft.getTokenCounter()
                              assert.equal(tokenCounter, 1n)
                              resolve(1)
                          } catch (e) {
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNft.getMintFee()
                          // 发送requestId
                          const requestNftTx = await randomIpfsNft.requestNft({ value: fee })
                          const receipt = await requestNftTx.wait()
                          const requestId = receipt!.logs[1].topics[1]
                          // 模拟发送随机数
                          await vrfCoordinatorV2_5Mock.fulfillRandomWords(
                              requestId,
                              randomIpfsNft.getAddress()
                          )
                      } catch (e) {
                          reject(e)
                      }
                  })
              })
          })
      })
