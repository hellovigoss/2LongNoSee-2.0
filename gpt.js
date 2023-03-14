import axios from 'axios'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
const apiKey = 'YOUR-API-KEY';
const chatCount = 10;
let paragraphFormPrompt = "你将得到一串聊天记录，希望你能够对这些记录进行摘要。要求简明扼要，以一段话的形式输出。"
let outlineFormPrompt = "你将得到一串聊天记录，希望你能够对这些记录进行摘要。要求简明扼要，以包含列表的大纲形式输出。"

export default async () => {
    const db = await open({
        filename: './chat-message.db',
        driver: sqlite3.Database
    })

    let chatSet = await getWd();
    let gptSet = []
    for (let room in chatSet) {
        let gptRes = {};
        gptRes[room] = chatSet[room];
        gptSet.push(gptRes);
    }
    console.log(gptSet);
    db.close()
    return gptSet;

    /**
     * 数据库中获取相关聊天记录
     */
    async function getWd() {
        const rooms = await db.all('select room from (select count(id) as room_chat_count, room from msg where deleted = 0 group by room) where room_chat_count > ' + chatCount)
        if (rooms.length == 0) {
            return {}
        }
        let roomInArr = [];
        rooms.forEach(room => { roomInArr.push(`'${room.room}'`) })
        console.log(roomInArr)
        const result = await db.all('SELECT * FROM msg where deleted = 0 and room in (' + roomInArr.join(',') + ')')
        let chatSet = {}
        result.forEach(item => {
            let date = new Date(parseInt(item.date))
            chatSet[item.room] += `${item.contact}[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]:${item.content}\n`
            db.run('update msg set deleted = 1 where id = ?', item.id)
        })
        return chatSet
    }

    /**
     * 查询chatGPT结果
     * @param {*} wd 
     * @returns 
     */
    async function getGPT(wd) {
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
            return response.data.choices[0].message.content
        }
        catch (err) {
            console.error(err)
        }
    }
}
