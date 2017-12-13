let env = require('dotenv').config()
env = require('dotenv-parse-variables')(env.parsed)
const commandLineArgs = require('command-line-args')(require('./option-definitions'))
const CoinbaseClient = require('./coinbase-client')

function filterRates(rates) {
    return Object.keys(rates).reduce(function(obj, key) {
        if(env.DISPLAY_RATES_FOR.some((c) => c === key))
            obj[key] = parseFloat(rates[key]);

        return obj
        }, {})
}

async function main() {
    const c1 = new CoinbaseClient(env.COINBASE_API_BASE_URL, env.COINBASE_API_KEY, env.COINBASE_API_SECRET)

    console.log(filterRates((await c1.getExchangeRates(commandLineArgs.currency)).data.rates))
}

main()
