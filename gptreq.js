import axios from 'axios'
const apiKey = 'YOUR-API-KEY';
let paragraphFormPrompt = "你将得到一串聊天记录，希望你能够对这些记录进行摘要。要求简明扼要，以一段话的形式输出。"
let outlineFormPrompt = "你将得到一串聊天记录，希望你能够对这些记录进行摘要。要求简明扼要，以包含列表的大纲形式输出。"

/**
 * 查询chatGPT结果
 * @param {*} wd 
 * @returns 
 */
export default async (wd, callback) => {
    try {
        const response = await axios.post(
            'http://openai.xfyun.cn/v1/chat/completions',
            {
                "model": "gpt-3.5-turbo",
                "messages": [
                    { "role": "system", "content": outlineFormPrompt },
                    { "role": "user", "content": wd }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                }
            }
        )
        console.log(response.data.choices[0].message.content)
        callback(response.data.choices[0].message.content)
        return response.data.choices[0].message.content
    }
    catch (err) {
        console.error(err)
    }
}
