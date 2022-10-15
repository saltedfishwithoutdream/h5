import { v4 as uuidv4 } from 'uuid'
import fileExtension from 'file-extension'
import OSS from 'ali-oss'
// import { bucket, publishImgPath } from 'dict/const'
// import { getOSSToken, getCmsOSSToken } from 'api/interfaces/upload'
import { message } from 'ant-design-vue'
import _ from 'lodash'
import { AxiosWrapper } from '@/utils/http.js'

const publishImgPath = 'https://sobe-dev.oss-cn-shanghai.aliyuncs.com'
const bucket = 'sobe-dev'
const emptyFn = () => {}

// 获取所有service
function getOSSToken (type = 1) {
    return new AxiosWrapper({ commit: emptyFn }).get('/tokens?type=1').then(res => {
    // this.total = res.data.count
    return res.data
    })
}

function getCmsOSSToken (type = 1) {
    return new AxiosWrapper({ commit: emptyFn }).get('/dp/cloud/oss_token?type=1').then(res => {
        // this.total = res.data.count
        return res.data
    })
}

let ossTokenInfo = {}
let ossCmsTokenInfo = {}
let ossClient = null // oss客户端实例
let ossCmsClient = null // oss cms客户端实例

export function generateFileName (fileName) {
    const date = new Date()
    const name = [date.getFullYear(), date.getMonth() + 1, date.getDate(), uuidv4()]
    return name.join('/').concat(`.${fileExtension(fileName)}`)
}

async function getStsToken () {
    const { aliyun: r } = await getOSSToken()
    return {
        accessKeyId: r.access_key_id,
        accessKeySecret: r.access_key_secret,
        stsToken: r.access_key_security,
        expiration: Date.now() + 3000000 // new Date(r.expiration).valueOf()
    }
}
async function getCmsStsToken () {
    const { aliyun: r } = await getCmsOSSToken()
    return {
        accessKeyId: r.access_key_id,
        accessKeySecret: r.access_key_secret,
        stsToken: r.access_key_security,
        expiration: Date.now() + 3000000 // new Date(r.expiration).valueOf()
    }
}

export function clearTokenInfo () {
    ossTokenInfo = {}
}

export async function getOSSClient () {
    if (!ossTokenInfo.expiration || ossTokenInfo.expiration < Date.now()) {
        try {
            ossTokenInfo = await getStsToken()
        } catch (e) {
            console.log(e.toString())
        }
    }
    ossClient = new OSS({
        region: 'oss-cn-shanghai',
        accessKeyId: ossTokenInfo.accessKeyId,
        accessKeySecret: ossTokenInfo.accessKeySecret,
        stsToken: ossTokenInfo.stsToken, //
        bucket: bucket,
        timeout: 600000,
        refreshSTSToken: async () => {
            const info = await getStsToken()
            return {
                accessKeyId: info.accessKeyId,
                accessKeySecret: info.accessKeySecret,
                stsToken: info.stsToken
            }
        },
        refreshSTSTokenInterval: 300000
    })
    return ossClient
}

export async function getCmsOSSClient () {
    if (!ossCmsTokenInfo.expiration || ossCmsTokenInfo.expiration < Date.now()) {
        try {
            ossCmsTokenInfo = await getCmsStsToken()
        } catch (e) {
            console.log(e.toString())
        }
    }
    ossCmsClient = new OSS({
        region: 'oss-cn-shanghai',
        accessKeyId: ossCmsTokenInfo.accessKeyId,
        accessKeySecret: ossCmsTokenInfo.accessKeySecret,
        stsToken: ossCmsTokenInfo.stsToken, //
        bucket: bucket,
        timeout: 600000,
        refreshSTSToken: async () => {
            const info = await getCmsStsToken()
            return {
                accessKeyId: info.accessKeyId,
                accessKeySecret: info.accessKeySecret,
                stsToken: info.stsToken
            }
        },
        refreshSTSTokenInterval: 300000
    })
    return ossCmsClient
}

export function joinImgPath (name = '') {
    // return publishImgPath + name;
    if (name && !/^https?/.test(name)) {
        if (name['0'] === '/') {
            // 兼容/开头
            return publishImgPath + name
        } else {
            return publishImgPath + '/' + name
        }
    } else {
        return name
    }
}

export function getFileNameFromPath (name = '') {
    const index = _.lastIndexOf(name, '/')
    if (index > -1) return name?.slice(index + 1)
    else return name
}

export function handleImgType (file, type) {
    // console.log(file, type);
    // 创建文件读取对象
    const fr = new FileReader()

    // 读取图片
    fr.readAsArrayBuffer(file); // 读取file文件

    const hex2string = (byte) => {
        // 3 => 03  5 => 05
        return byte.toString(16).padStart(2, '0')
    }

    // 工厂函数
    const getFileType = (hex) => {
        return (arrayBuffer) => {
            const int8Array = new Uint8Array(arrayBuffer);
            // 截取前两组
            const data = int8Array.slice(0, 2)
            // console.log(data);
            const hexArr = hex.split(/\s+/)
            let flag = true
            data.map((item, index) => {
                // console.log(hex2string(item.toString(16)));
                // console.log(hexArr);
                if (hex2string(item.toString(16)) !== hexArr[index]) {
                    flag = false
                }
            })
            return flag
        }
    }
    const fileType = {
        jpeg: getFileType('ff d8'),
        jpg: getFileType('ff d8'),
        gif: getFileType('47 49'),
        png: getFileType('89 50'),
        bmp: getFileType('42 4d')
        // pdf: getFileType("25 50"),
        // zip: getFileType("50 4b")
    };
    return new Promise((resolve, reject) => {
        // 添加load事件
        fr.addEventListener('load', () => {
            const arrBuffer = fr.result
            let checkType = []
            let bool = false
            for (let aaa in fileType) {
                if (type.find((bbb) => bbb == aaa)) {
                    checkType[aaa] = fileType[aaa]
                }
            }
            for (let ft in checkType) {
                if (checkType[ft] instanceof Function) {
                    if (checkType[ft](arrBuffer)) {
                        bool = true
                        break
                    }
                }
            }
            if (bool) {
                resolve()
            } else {
                message.warn('请上传正确格式的图片')
                reject('请上传正确格式的图片');
            }
        })
    })
}

export async function getOssTokenInfo () {
    if (!ossTokenInfo.expiration || ossTokenInfo.expiration < Date.now()) {
        try {
            ossTokenInfo = await getStsToken()
        } catch (e) {
            console.log(e.toString())
        }
    }
    return ossTokenInfo
}

export async function getCmsOssTokenInfo () {
    if (!ossCmsTokenInfo.expiration || ossCmsTokenInfo.expiration < Date.now()) {
        try {
            ossCmsTokenInfo = await getCmsStsToken()
        } catch (e) {
            console.log(e.toString())
        }
    }
    return ossCmsTokenInfo
}
