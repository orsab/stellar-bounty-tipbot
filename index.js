require("dotenv").config();
const { Client, Intents } = require("discord.js");
const { tipMember, linkMember, infoMember, initBot } = require("./discord");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ["USER", "REACTION", "MESSAGE"],
});

client.on("ready", (param) => {
  // Init bot with relevant slash functions
  initBot(client)
    .then(() => {
      console.log(`Bot ready!`);
    })
    .catch((e) => {
      console.error(`Bot initialization error!`, e);
    });
});

// Event handle for slash functions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, member } = interaction;

  if (commandName === "tip") {
    const amount = options.data.find((d) => d.name === "amount")?.value;
    const targetMemberId = options.data.find((d) => d.name === "member")?.value;

    await interaction.reply({
      content: `Account tip in progress...`,
      ephemeral: true,
    });

    const guild = client.guilds.cache.get(process.env.DISCORDJS_GUILDID);
    const targetMember = guild.members.cache.get(targetMemberId);
    const memberUser = guild.members.cache.get(member.user.id);

    await tipMember(amount, targetMemberId, memberUser)
      .then(({ type }) => {
        // Account not exists
        if (type === -1) {
          Promise.all([
            interaction.followUp({
              content: `Account <@!${member.id}> not exist or not funded`,
              ephemeral: true,
            }),
            targetMember.send(
              `You don't have the Stellar account, please got to: https://lobstr.co or another resource and create address to be able receive the tips. 
              After this type ``` /
                link <
                address >
                ```. Thank you`
            ),
          ]);
        }
        // Trustline not exists
        else if (type === -2) {
          Promise.all([
            interaction.followUp({
              content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} sended in claimable balance to <@!${targetMember.id}>`,
              ephemeral: true,
            }),
            targetMember.send({
              content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} received in claimable balance from @${memberUser.user.username}`,
              ephemeral: true,
            }),
          ]);
        } else if (type === 0) {
          Promise.all([
            interaction.followUp({
              content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} sended to @${targetMember.id}`,
              ephemeral: true,
            }),
            targetMember.send({
              content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} received from <@!${memberUser.id}>`,
              ephemeral: true,
            }),
          ]);
        }
      })
      .catch((e) => {
        interaction.member.send({
          content: `Tip fail: ${e}`,
          ephemeral: true,
        });
      });
  } else if (commandName === "link") {
    const address = options.data.find((d) => d.name === "address")?.value;

    await interaction.reply({
      content: "Link in progress...",
      ephemeral: true,
    });

    await linkMember(interaction.member.id, address)
      .then((member) => {
        interaction.followUp({
          content: `Account account linked`,
          ephemeral: true,
        });
      })
      .catch((e) => {
        interaction.member.send({
          content: `Link account fail: ${e}`,
          ephemeral: true,
        });
      });
  } else if (commandName === "info") {
    await interaction.reply({
      content: "Info in progress...",
      ephemeral: true,
    });

    await infoMember(interaction)
      .then((member) => {
        interaction.followUp({
          content: JSON.stringify(member),
          ephemeral: true,
        });
      })
      .catch((e) => {
        interaction.followUp({
          content: `Info fail: ${e}`,
          ephemeral: true,
        });
      });
  }
});

// Reaction event handler
client.on("messageReactionAdd", (reaction, user) => {
  let amount = 0;
  const targetMemberId = reaction.message?.author?.id;

  // Old message - TODO
  if (!targetMemberId) {
    
    console.log("Message is to old, try on new message");
    return;
  }

  switch (reaction.emoji.name) {
    case "🐻‍❄️":
      amount = 100;
      break;
    case "🐻":
      amount = 10;
      break;
    case "🐼":
      amount = 5;
      break;
    case "🧸":
      amount = 1;
      break;
  }

  const guild = client.guilds.cache.get(process.env.DISCORDJS_GUILDID);

  const targetMember = guild.members.cache.get(targetMemberId);
  const memberUser = guild.members.cache.get(user.id);

  tipMember(amount, targetMemberId, memberUser)
    .then(({ type }) => {
      // Account not exists
      if (type === -1) {
        interaction.reply({
          content: `Account <@!${reaction.message.author.id}> not exists or not funded`,
          ephemeral: true,
        });
        reaction.message.author.send(
          `You don't have the Stellar account, please got to: https://lobstr.co or another resource and create address to be able receive the tips. After this type ``` /
            link <
            address >
            ```. Thank you`
        );
      }
      // Trustline not exists
      else if (type === -2) {
        Promise.all([
          user.send({
            content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} sended in claimable balance to <@!${targetMember.id}>`,
            ephemeral: true,
          }),
          targetMember.send({
            content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} received in claimable balance from @${user.username}`,
            ephemeral: true,
          }),
        ]);
      } else if (type === 0) {
        Promise.all([
          user.send({
            content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} sended to <@!${targetMember.id}>`,
            ephemeral: true,
          }),
          targetMember.send({
            content: `Tip of ${amount} ${process.env.TIP_ASSET_CODE} received from <@!${user.id}>`,
            ephemeral: true,
          }),
        ]);
      }
    })
    .catch((e) => {
      user.send({
        content: `Tip fail: ${e}`,
        ephemeral: true,
      });
    });
});

client.on("message", (msg) => {
  console.log(msg.content);
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
