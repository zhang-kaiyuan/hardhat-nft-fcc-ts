import { PinataSDK } from "pinata-web3"
import path from "path"
import fs from "fs"
import { fileUtils } from "./fileUtils"

const pinataJWT = process.env.PINATA_JWT
const pinataGateway = process.env.PINATA_GATEWAY
const pinata = new PinataSDK({
    pinataJwt: pinataJWT,
    pinataGateway: pinataGateway,
})

export const pinataUtils = {
    storeImages: async (imagesFilePath: string) => {
        const fullImagesPath = path.resolve(imagesFilePath)
        const files = fs.readdirSync(fullImagesPath)
        let responses = []
        console.log("Uploading to IPFS!")
        for (const fileName of files) {
            console.log(`working on ${fileName}!`)
            const file = await fileUtils.createFileFromUrl(
                `${fullImagesPath}/${fileName}`,
                fileName,
                "image/png"
            )
            try {
                const response = await pinata.upload.file(file)
                responses.push(response)
            } catch (e) {
                console.log(e)
            }
        }
        return { responses, files }
    },
    storeTokenUriMetadata: async (metadata: object) => {
        try {
            const response = await pinata.upload.json(metadata)
            return response
        } catch (e) {
            console.log(e)
        }
        return null
    },
}
