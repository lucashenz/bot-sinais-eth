require("dotenv").config();
const venom = require("venom-bot");
const axios = require("axios");

const API_KEY = process.env.API_KEY;
let connectedClient = null;
let lastPrice = null; 

venom
  .create({
    session: 'session-name',
    headless: true,
    browserPathExecutable: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    browserArgs: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
  })
  .then((client) => {
    console.log('Sessão iniciada');
    connectedClient = client;
    setInterval(start, 300000); 
    start(); 
  })
  .catch((erro) => {
    console.error('Erro ao iniciar o Venom:', erro);
  });

function sendMessage(text) {
  if (!connectedClient) {
    console.error('Client ainda não conectado!');
    return;
  }

  connectedClient.sendText("5551998704012@c.us", text)
    .then((result) => console.log('Mensagem enviada:', result))
    .catch((error) => console.error('Erro ao enviar mensagem:', error));
}

async function start() {
  const query = `
    {
      pool(id:"0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640") {
        token0Price
      }
    }
  `;

  try {
    const { data } = await axios.post(
      `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`,
      { query }
    );

    const price = parseFloat(data.data.pool.token0Price);
    console.log("Preço atual:", price);

    if (lastPrice) {
      const change = ((price - lastPrice) / lastPrice) * 100;

      if (change >= 10) {
        sendMessage(`🚀 O preço do Ethereum subiu ${change.toFixed(2)}%! Novo preço: $${price}`);
      } else if (change <= -10) {
        sendMessage(`📉 O preço do Ethereum caiu ${Math.abs(change).toFixed(2)}%! Novo preço: $${price}`);
      }
    }

    lastPrice = price;
  } catch (error) {
    console.error("Erro ao buscar preço:", error);
  }
}
