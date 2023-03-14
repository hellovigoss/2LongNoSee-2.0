import { WechatyBuilder } from 'wechaty'
import newMsg from './db.js'
import gpt from './gpt.js'
import gptreq from './gptreq.js'
const loadingStr = [
  '🤣等一哈，正在查，辣个chatGPT慢不赖我，莫着急...',
  '🤣着急个锤子，人工智能也要思考的好不好...',
  '🤣跟我一起，倒数五个数，5 4 3 2 1 0.9 0.8 ...',
  '🤣对，我还在，我没有死机，还在查CPU快特么冒烟了...',
  '🤣哥，你上班尽摸鱼啊？辣么多群消息...',
]
let loadingStrLen = loadingStr.length

const wechaty = WechatyBuilder.build() // get a Wechaty instance
wechaty
  .on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\nhttps://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`))
  .on('login', (user) => {
    console.log(`User ${user} logged in`)
  })
  .on('message', async (message) => {
    console.log(`Message: ${message}`)
    const text = message.text()
    if ('2long' == text) {
      await wechaty.say('✊等一哈，正在查，马上来...')
      let interval = setInterval(() => {
        wechaty.say(loadingStr[Math.floor((Math.random() * loadingStrLen))])
      }, 30000)
      let gptSet = await gpt()
      clearInterval(interval)
      console.log('got gptset '+gptSet+' length: ' + gptSet.length)
      if (gptSet.length == 0) {
        wechaty.say('💢这段时间么得聊得火热的群，你也别想着摸鱼了！努力干活吧！')
        return
      }
      gptSet.forEach((gpt) => {
        for (let key in gpt) {
          gptreq(gpt[key], (res) => {
            wechaty.say('【' + key + '】\r\n🚀==============🚀\r\n群聊本时段太长不看版本：\r\n🚀==============🚀\r\n' + res)
          })
        }
      })
    }

    const room = message.room()
    const type = message.type()
    if (room && type === wechaty.Message.Type.Text) {
      // const contact = message.from()
      const contact = message.talker()
      const date = message.date()
      const topic = await room.topic()
      console.log(`insert Room: ${topic} Contact: ${contact.name()} Content: ${text} Date: ${date}`)
      newMsg(topic, contact.name(), text, date)
    }
  })
await wechaty.start()