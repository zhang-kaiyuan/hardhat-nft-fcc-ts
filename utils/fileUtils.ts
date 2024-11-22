import { readFile } from "fs/promises"
export const fileUtils = {
    // 创建file对象
    createFileFromUrl: async (url: string, fileName: string, fileType: string): Promise<File> => {
        try {
            const response = await readFile(url)
            const blob = new Blob([response], { type: fileType })
            return new File([blob], fileName, { type: fileType })
        } catch (error) {
            throw error
        }
    },
}
