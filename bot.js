// Copyright (c) 2019, The TurtleCoin Developers

const Discord = require("discord.js");
const client = new Discord.Client();

client.login(process.env.DISCORDTOKEN);

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("with DNS");
    var statusChannel = client.channels.get("574186700021170186"); // TRTL NETWORK / DEV_DNS
    // var statusChannel = client.channels.get("574171958980247562"); // STAGE SERVER / DNS_STATUS
    statusChannel.send(
        ":bee: :honey_pot: :fire: :wind_blowing_face: :drooling_face: "
    );
    console.log("Servers:");
    client.guilds.forEach(guild => {
        console.log(" - " + guild.name);
    });
});

function commandHandler(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(6);
    let splitCommand = fullCommand.split(" ");
    let primaryCommand = splitCommand[0];
    let arguments = splitCommand.slice(1);

    console.log("\nCommand received: " + primaryCommand);
    console.log("TYPE: " + arguments[0]);
    console.log("DEST: " + arguments[1]);
    console.log("SOURCE: " + arguments[2]);

    var statusChannel = client.channels.get("574186700021170186"); // TRTL NETWORK / DEV_DNS
    // var statusChannel = client.channels.get("574171958980247562"); // STAGE SERVER / DNS_STATUS
    statusChannel.send(
        "Message received from " +
            receivedMessage.author.toString() +
            ": " +
            receivedMessage.content
    );

    if (primaryCommand == "help") {
        helpCommand(receivedMessage);
    } else if (primaryCommand == "register") {
        registerCommand(arguments, receivedMessage);
    } else {
        receivedMessage.channel.send("That's not a command I understand yet.");
    }
}

client.on("message", receivedMessage => {
    var statusChannel = client.channels.get("574186700021170186"); // TRTL NETWORK / DEV_DNS
    // var statusChannel = client.channels.get("574171958980247562"); // STAGE SERVER / DNS_STATUS
    if (receivedMessage.author == client.user) {
        return;
    }

    if (receivedMessage.content.startsWith(".trtl")) {
        commandHandler(receivedMessage);
    }

    if (receivedMessage.content === "ping") {
        currentdate = Date();
        receivedMessage.react("🐢");
        console.log(currentdate, "\n PONG");
    }
});

function helpCommand(receivedMessage) {
    receivedMessage.channel.send(
        "HELP!\nActivate me with **.trtl <command>**\nCommands: `register`, `help`"
    );
}

function registerCommand(arguments, receivedMessage) {
    if (arguments.length < 3) {
        receivedMessage.channel.send(
            "Not enough values to register. The syntax should be `.trtl register <TYPE> <DESTINATION> <SOURCE/VALUE>`"
        );
        receivedMessage.react("💩");
    }
    if (arguments.length > 3) {
        receivedMessage.channel.send(
            "Too many values to register. The syntax should be `.trtl register <TYPE> <DESTINATION> <SOURCE/VALUE>`"
        );
        receivedMessage.react("💩");
    }
    if (arguments.length === 3) {
        receivedMessage.channel.send("number of args is correct");
    }

    // TODO check if argument for type is one of the options
    if (arguments[0].includes(recordTypes.some())) {
        var recordTypes = ["A", "TXT", "CNAME"];
        receivedMessage.channel.send(
            "This is not a record type I understand yet. Options: `A`, `TXT`, `CNAME`."
        );
        receivedMessage.react("💩");
    }
    if (arguments[0] === recordTypes.some()) {
        receivedMessage.channel.send("This is fine.");
    }
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
