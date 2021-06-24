import tmi from 'tmi.js'
import { BOT_USERNAME, OAUTH_TOKEN, CHANNEL_NAME, BLOCKED_WORDS } from './constants'

const options = {
    options: { debug: true },
    connection: {
        reconnect: true,
        secure: true,
        timeout: 180000,
        reconnectDecay: 1.4,
        reconnectInterval: 1000,
    },
    identity: {
        username: BOT_USERNAME,
        password: OAUTH_TOKEN
    },
    channels: [ CHANNEL_NAME ]
}

const client = new tmi.Client(options);

client.connect()

// Events
client.on('disconnected', (reason) => {
    onDisconnectHandler(reason)
})

client.on('connected', (address, port) => {
    onConnectHandler(address, port)
})

client.on('hosted', (channel, username, viewers, autohost) => {
    onHostedHandler(channel, username, viewers, autohost)
})

client.on('subscription', (channel, username, method, message, userstate) => {
    onSubscriptionHandler(channel, username, method, message, userstate)
})

client.on('raided', (channel, username, viewers) => {
    onRaidedHandler(channel, username, viewers)
})

client.on('cheer', (channel, userstate, message) => {
    onCheerHandler(channel, userstate, message)
})

client.on('giftpaidupgrade', (channel, username, sender, userstate) => {
    onGiftPaidUpgradeHandler(channel, username, sender, userstate)
})

client.on('hosting', (channel, target, viewers) => {
    onHostingHandler(channel, target, viewers)
})

client.on('reconnect', () => {
    reconnectHandler()
})

client.on('resub', (channel, username, months, message, userstate, methods) => {
    resubHandler(channel, username, months, message, userstate, methods)
})

client.on('subgift', (channel, username, streakMonths, recipient, methods, userstate) => {
    subGiftHandler(channel, username, streakMonths, recipient, methods, userstate)
})

// Event handlers

client.on('message', (channel, userstate, message, self) => {
    if(self) {
        return
    }

    if (userstate.username === BOT_USERNAME) {
        console.log(`Not checking bot's message.`)
        return
    }

    if(message.toLowerCase() === '!hello') {
        hello(channel, userstate)
        return
    }

    if(message.toLowerCase() === "!ping") {
        ping(channel, userstate)
        return
    }

    if(message.toLowerCase() === "!tillykke") {
        congratulations(channel, userstate)
        return
    }

    onMessageHandler(channel, userstate, message, self)
})

function onMessageHandler (channel, userstate, message, self) {
    checkTwitchChat(userstate, message, channel)
}

function onDisconnectHandler(reason) {
    console.log(`Disconnected: ${reason}`)
}

function onConnectHandler(address, port) {
    console.log(`Connected: ${address}:${port}`)
}

function onHostedHandler(channel, username, viewers, autohost) {
    client.say(channel,
        `Thank you@${username} for the host of ${viewers}!`
    )
}

function onRaidedHandler(channel, username, viewers) {
    client.say(channel,
        `Thank you @${username} for the raid of ${viewers}!`
    )
}

function onSubscriptionHandler(channel, username, method, message, userstate) {
    client.say(channel,
        `Thank you @${username} for subscribing!`
    )
}

function onCheerHandler(channel, userstate, message) {
    client.say(channel, 
        `Thank you @${userstate.username} for the ${userstate.bits} bits!`)
}

function onGiftPaidUpgradeHandler(channel, username, sender, userstate) {
    client.say(channel,
        `Thank you @{username} for continuing your gifted sub!`
    )
}

function onHostingHandler(channel, target, viewers) {
    client.say(channel,
        `We are now hosting ${target} with ${viewers} viewers!`
    )
}

function reconnectHandler() {
    console.log('Reconnecting...')
}

function resubHandler(channel, username, months, message, userstate, methods) {
    const cumulativeMonths = userstate['msg-param-cumulative-months']
    client.say(channel,
        `Thank you @${username} for the ${cumulativeMonths} sub!`
    )
}

function subGiftHandler(channel, username, streakMonths, recipient, methods, userstate) {
    client.say(channel,
        `Thank you @${username} for gifting a sub to ${recipient}`
    )
}

function hello (channel, userstate) {
    client.say(channel, `@${userstate.username}, Heya!`)
}

function ping (channel, userstate) {
    client.say(channel, `@${userstate.username}, Pong!`)
}

function congratulations (channel, userstate) {
    client.say(channel, `🇩🇰 Tilykke @${channel}, Du er nu en del af DeerForce Streamer Community TwitchVotes 🇩🇰`)
}

function checkTwitchChat(userstate, message, channel) {
    console.log(message)
    message = message.toLowerCase()
    let shouldSendMessage = false
    shouldSendMessage = BLOCKED_WORDS.some(blockedWord => message.includes(blockedWord.toLowerCase()))
    if (shouldSendMessage) {
        // Tell user
        client.say(channel, `@${userstate.username}, sorry! Your message was deleted.`)
        // Delete message
        client.deleteMessage(channel, userstate.id)
    }
}