// 2000文字ずつに分割して送信する関数
async function sendSplittedMsg(channel, msg) {
  const max = 2000;
  const msgCount = Math.ceil(msg.length / max);
  for (let i = 0; i < msgCount; i++) {
    const start = max * i;
    const end = start + max;
    await channel.send(msg.slice(start, end));
  }
}

module.exports = { sendSplittedMsg };
