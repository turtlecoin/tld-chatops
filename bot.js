// Copyright (c) 2019, TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

'use strict'

const Config = require('./config.json')
const Discord = require('discord.js')
const DNS = require('dns')
const util = require('util')
// const Address4 = require('ip-address').Address4
// const Address6 = require('ip-address').Address6

// Set our DNS server(s) to those for the .trtl TLD
DNS.setServers(Config.dnsServers)

const client = new Discord.Client()

if (!process.env.DISCORDTOKEN) {
  throw new Error(
    'You must supply the BOT Discord Token in the enviromental variable DISCORDTOKEN'
  )
}

/* Helper functions that catch promise errors and always resolve with their status */
function tryChannelSendMessage (channel, message) {
  return new Promise((resolve, reject) => {
    channel
      .send(message)
      .then(() => {
        return resolve(true)
      })
      .catch(() => {
        return resolve(false)
      })
  })
}

function tryMessageReact (message, reaction) {
  return new Promise((resolve, reject) => {
    message
      .react(reaction)
      .then(() => {
        return resolve(true)
      })
      .catch(() => {
        return resolve(false)
      })
  })
}

function resolveHostname (hostname) {
  return new Promise((resolve, reject) => {
    DNS.resolve(hostname, 'A', (err, records) => {
      if (err) return reject(err)
      return resolve(records)
    })
  })
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)

  client.user.setActivity('with DNS')

  const statusChannel = client.channels.get(Config.channels.status)

  tryChannelSendMessage(
    statusChannel,
    ':bee: :honey_pot: :fire: :wind_blowing_face: :drooling_face:'
  ).then(success => {
    if (success) {
      console.log('Servers:')
      client.guilds.forEach(guild => console.log(' - ' + guild.name))
    } else {
      console.warn(
        'Could not send a message to the configured status channel'
      )
    }
  })
})

client.on('message', receivedMessage => {
  // const statusChannel = client.channels.get(Config.channels.status)

  if (receivedMessage.author === client.user) {
    return
  }

  if (receivedMessage.content.startsWith('.trtl')) {
    commandHandler(receivedMessage)
  }

  if (receivedMessage.content === 'ping') {
    const currentdate = Date()
    tryMessageReact(receivedMessage, '🐢')
    console.log(currentdate, '\n PONG')
  }
})

// Login after we have defined our events to make sure that we catch all of them
client.login(process.env.DISCORDTOKEN)

function commandHandler (receivedMessage) {
  const fullCommand = receivedMessage.content.substr(6)
  const splitCommand = fullCommand.split(' ')
  const primaryCommand = splitCommand[0]
  const args = splitCommand.slice(1)

  console.log('\nCommand received: ' + primaryCommand)
  console.log('TYPE: ' + args[0])
  console.log('DEST: ' + args[1])
  console.log('SOURCE: ' + args[2])

  const statusChannel = client.channels.get(Config.channels.status)

  tryChannelSendMessage(
    statusChannel,
    util.format(
      'Message received from %s: %s',
      receivedMessage.author.toString(),
      receivedMessage.content
    )
  )

  switch (primaryCommand.toLowerCase()) {
    case 'help':
      return helpCommand(receivedMessage)
    case 'register':
      return registerCommand(args, receivedMessage)
    case 'check':
      return checkDomainARecord(args, receivedMessage)
    default:
      return tryChannelSendMessage(
        receivedMessage.channel,
        'That is not a command I understand yet'
      )
  }
}

function helpCommand (receivedMessage) {
  tryChannelSendMessage(
    receivedMessage.channel,
    'HELP!\nActivate me with **.trtl <command>**\nCommands: `register`, `help`, `check`'
  )
}

function registerCommand (args, receivedMessage) {
  if (args.length < 3) {
    tryChannelSendMessage(
      receivedMessage.channel,
      'Not enough values to register. The syntax should be `.trtl register <TYPE> <DESTINATION> <SOURCE/VALUE>`'
    )
    return tryMessageReact(receivedMessage, '💩')
  }
  if (args.length > 3) {
    tryChannelSendMessage(
      receivedMessage.channel,
      'Too many values to register. The syntax should be `.trtl register <TYPE> <DESTINATION> <SOURCE/VALUE>`'
    )
    return tryMessageReact(receivedMessage, '💩')
  }
  if (args.length === 3) {
    tryChannelSendMessage(
      receivedMessage.channel,
      'Number of arguments is correct'
    )
  }

  const recordTypes = ['A', 'TXT', 'CNAME'] // Record types we handle

  /* Verify that our first argument is indeed one of the record types that
     we know how to handle or exit early */
  if (recordTypes.indexOf(args[0].toUpperCase()) === -1) {
    tryChannelSendMessage(
      receivedMessage.channel,
      'This is not a record type I understand yet. Options: `A`, `TXT`, `CNAME`.'
    )
    return tryMessageReact(receivedMessage, '💩')
  }

  const freeTierCommunities = [
    '.fork.trtl',
    '.pool.trtl',
    '.user.trtl',
    '.node.trtl',
    '.dev.trtl',
    '.bot.trtl'
  ] // Community suffixes we handle

  const validDomain = freeTierCommunities.some(domain =>
    args[1].toLowerCase().endsWith(domain)
  )

  // zpalm's validation
  if (!validDomain) {
    tryChannelSendMessage(
      receivedMessage.channel,
      'This is not a community suffix I recognize yet. Options: `.fork.trtl`, `.pool.trtl`, `.user.trtl`, `.node.trtl`, `.dev.trtl`, `.bot.trtl`'
    )
    return tryMessageReact(receivedMessage, '🐢')
  } else {
    tryChannelSendMessage(
      receivedMessage.channel,
      '**[PASS]** Suffix type '
    )
    return tryMessageReact(receivedMessage, '💩')
  }

  // legacy community validation handler
  // if (freeTierCommunities.includes(args[1].toUpperCase())) {
  //     tryChannelSendMessage(
  //         receivedMessage.channel,
  //         "This is not a community suffix I recognize yet. Options: `.fork.trtl`, `.pool.trtl`, `.user.trtl`, `.node.trtl`, `.dev.trtl`, `.bot.trtl`"
  //     );
  //     return tryMessageReact(receivedMessage, "💩");
  // }
  // if (args[1].endsWith(freeTierCommunities)) {
  //     tryChannelSendMessage(
  //         receivedMessage.channel,
  //         "[PASS] Community type "
  //     );
  //     return tryMessageReact(receivedMessage, "🐢");
  // }
}

function checkDomainARecord (args, receivedMessage) {
  if (args.length !== 1 || args[0].toLowerCase().indexOf('.trtl') === -1) {
    tryChannelSendMessage(
      receivedMessage.channel,
      'You must specify a .trtl domain to check. The syntax should be `.trtl check <DOMAIN>.trtl`'
    )
    return tryMessageReact(receivedMessage, '💩')
  }

  resolveHostname(args[0].toLowerCase())
    .then(records => {
      tryChannelSendMessage(
        receivedMessage.channel,
        util.format(
          'Resolved %s to %s',
          args[0].toLowerCase(),
          records.join(',')
        )
      )
      return tryMessageReact(receivedMessage, '🐢')
    })
    .catch(() => {
      tryChannelSendMessage(
        receivedMessage.channel,
        'Could not resolve the specified domain'
      )
      return tryMessageReact(receivedMessage, '💩')
    })
}

/*
spendBack() {

  - pick a span of time in the future
  - balance / # of tx in spendBack span = payload amount
  - send min tx to trtlbot++ with payload amount as fee
  - delay 30s
  - next payload until spendBack is empty

}
*/
