let env = require('dotenv').config()
env = require('dotenv-parse-variables')(env.parsed)
const commandLineArgs = require('command-line-args')(require('./option-definitions'))
const CoinbaseClient = require('./CoinbaseClient')

async function main() {
    const c1 = new CoinbaseClient(env.COINBASE_API_BASE_URL, env.COINBASE_API_KEY, env.COINBASE_API_SECRET)
    const response = await c1.getExchangeRates("BTC")

    const result = Object.keys(response.data.rates).reduce(function(obj, key) {
        if(env.DISPLAY_RATES_FOR.some((c) => c === key))
            obj[key] = parseFloat(response.data.rates[key]);

        return obj
        }, {})

    console.log(result)
}

main()