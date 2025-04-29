# 🛒 Sistema de Monitoramento de Preços em Tempo Real

Um sistema de microsserviços que monitora preços de produtos em e-commerces e envia notificações sempre que houver uma alteração significativa no preço, usando mensageria assíncrona com RabbitMQ.

---

## 🧱 Arquitetura do Sistema

🔧 **Componentes principais:**

1. **📦 API de Cadastro de Produtos**
   - Cadastra produtos e publica em:
     - `product_monitoring_queue`
     - `price_history_queue`

2. **🔍 Microsserviço de Monitoramento de Preços**
   - Escuta `product_monitoring_queue`
   - Detecta variações (>10%) do valor do produto
   - Publica em `price_alert_queue` caso haja uma variação maior que 10%

3. **📢 Microsserviço de Notificação**
   - Escuta `price_alert_queue`
   - Envia alerta ao usuário

4. **📊 Microsserviço de Histórico de Preços**
   - Escuta `price_history_queue`
   - Armazena cada variação no SQLite com data/hora

---

## 📁 Estrutura do Repositório

```plaintext
.
├── api
│   ├── .env                           # Variáveis de ambiente da API
│   ├── package-lock.json               # Dependências da API
│   ├── package.json                    # Configurações do NPM
│   ├── src
│   │   ├── app.js                      # Configuração principal da aplicação
│   │   ├── controllers
│   │   │   └── productController.js    # Controlador para gerenciamento de produtos
│   │   ├── middlewares
│   │   │   ├── handler.js              # Middleware de erro
│   │   │   ├── hateos.js               # Middleware de HATEOAS
│   │   │   ├── validator.js            # Middleware de validação de dados
│   │   │   └── whitelist.js            # Middleware de whitelist de IPs
│   │   ├── models
│   │   │   └── productModel.js         # Modelo de dados de produtos
│   │   ├── routers
│   │   │   └── productRouter.js        # Roteador para produtos
│   │   └── services
│   │       └── publish.js              # Serviço de publicação de mensagens RabbitMQ
├── historyConsumer
│   ├── .env                           # Variáveis de ambiente do consumer de histórico
│   ├── package-lock.json               # Dependências do consumer de histórico
│   ├── price_history.sqlite            # Banco de dados SQLite de histórico de preços
│   ├── src
│   │   ├── consumer.js                 # Lógica do consumidor que salva o histórico de preços
│   │   └── services
│   │       └── connection.js           # Conexão com RabbitMQ
│   │       └── db.js                   # Configuração do banco de dados SQLite
├── monitorConsumer
│   ├── .env                           # Variáveis de ambiente do consumer de monitoramento de preços
│   ├── product_prices.json             # Armazenamento local de preços para comparação
│   ├── package-lock.json               # Dependências do consumer de monitoramento
│   ├── src
│   │   ├── consumer.js                 # Lógica do consumidor que monitora os preços
│   │   └── services
│   │       └── connection.js           # Conexão com RabbitMQ
│   │       └── publish.js              # Publicação das mensagens no RabbitMQ
├── notifyConsumer
│   ├── .env                           # Variáveis de ambiente do consumer de notificação
│   ├── package-lock.json               # Dependências do consumer de notificação
│   ├── src
│   │   ├── consumer.js                 # Lógica do consumidor que envia notificações
│   │   └── services
│   │       └── connection.js           # Conexão com RabbitMQ
├── rabbitMQContainers
│   ├── docker-compose.yml              # Docker Compose para subir o RabbitMQ
│   └── prometheus.yml                  # Configuração do Prometheus para monitoramento
└── README.md
```

---

## 🚀 Como Rodar o Projeto

### ✅ Pré-requisitos

- [Node.js](https://nodejs.org/)
- [RabbitMQ](https://www.rabbitmq.com/) ou `docker-compose`
- [SQLite](https://www.sqlite.org/)

---

### 🐳 Subindo o RabbitMQ

```bash
cd rabbitMQContainers
docker-compose up -d
```

- Acesse o painel: [http://localhost:15672](http://localhost:15672)
- Login padrão: `guest` / `guest`

---

### ⚙️ Configuração das Variáveis `.env`

#### API `.env`

```
RABBIT_MQ=amqp://localhost:5672
```

Idem para os demais consumers (`monitorConsumer`, `historyConsumer`, `notifyConsumer`).

---

### 📦 Instalação das Dependências

```bash
npm install          # Dentro de cada pasta: api/, monitorConsumer/, etc.
```

---

### ▶️ Rodando os Microsserviços

```bash
# API
cd api
npm start

# Monitoramento
cd ../monitorConsumer
npm start

# Histórico
cd ../historyConsumer
npm start

# Notificações
cd ../notifyConsumer
npm start
```

---

## 📬 Interagindo com a API

### 🔹 `POST /products`

Cadastra um produto para monitoramento.

#### Corpo da Requisição

```json
{
  "name": "Smartphone Galaxy S21",
  "price": 8000,
  "category": "Eletrônicos",
  "stock": 20,
  "ecommerce": "Amazon",
  "url" : "https://www.amazon.com.br/dp/B08N5WRWNW",
}
```

- Publica automaticamente em `product_monitoring_queue` e `price_history_queue`.

---

## 📈 Funcionamento

- 🔄 Produtos são monitorados em tempo real.
- 🔔 Variações de preço disparam alertas.
- 🧾 Cada mudança de preço é registrada com data e hora.
- 🧠 Comunicação entre serviços via **RabbitMQ**.

---

## 📜 Licença
Este projeto está licenciado sob a licença MIT.
