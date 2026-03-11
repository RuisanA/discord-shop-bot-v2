const http = require("http");
const {
  Client,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Permissions,
} = require("discord.js");
const moment = require("moment");
const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");
const util = require("util");
const path = require("path");
const cron = require("node-cron");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
require("dotenv").config();
const client = new Client({
  partials: ["CHANNEL"],
  intents: new Intents(32767),
});
const {
  Modal,
  TextInputComponent,
  SelectMenuComponent,
  showModal,
} = require("discord-modals");
const discordModals = require("discord-modals");
discordModals(client);
const newbutton = (buttondata) => {
  return {
    components: buttondata.map((data) => {
      return {
        custom_id: data.id,
        label: data.label,
        style: data.style || 1,
        url: data.url,
        emoji: data.emoji,
        disabled: data.disabled,
        type: 2,
      };
    }),
    type: 1,
  };
};
process.env.TZ = "Asia/Tokyo";
("use strict");
let guildId;

http
  .createServer(function (request, response) {
    try {
      response.writeHead(200, { "Content-Type": "text/plain;charset=utf-8" });
      response.end(
        `ログイン`
      );
    } catch (e) {
      console.log(e);
    }
  })
  .listen(3000);

if (process.env.DISCORD_BOT_TOKEN == undefined) {
  console.error("tokenが設定されていません！");
  process.exit(0);
}

client.on("ready", (client) => {
  console.log(`ログイン: ${client.user.tag}`);
  client.user.setActivity({
    type: "PLAYING",
    name: `R SERVER/販売`,
  });
  client.guilds.cache.size;
  client.user.setStatus("online");
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isButton()) {
      return;
    }
    console.log(interaction.customId);
    if (interaction.customId.startsWith("ticket")) {
      try {
        const category = interaction.customId.split("-")[1];
        const role = interaction.customId.split("-")[2];
        const welcome = interaction.customId.split("-")[3];

        const existingChannel = interaction.guild.channels.cache.find(
          (channel) =>
            channel.name === `🎫｜${interaction.user.username}` &&
            (category === "undefined" || channel.parentId === category)
        );

        if (existingChannel) {
          const errorembed = new MessageEmbed()
            .setTitle("error")
            .setDescription(`既にチケットを作成しています`)
            .setColor("RED")
            .setTimestamp();
          return interaction.reply({ embeds: [errorembed], ephemeral: true });
        }

        let newChannel;
        const overwrite = [
          {
            id: interaction.user.id,
            allow: [
              Permissions.FLAGS.VIEW_CHANNEL,
              Permissions.FLAGS.SEND_MESSAGES,
            ],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: [
              Permissions.FLAGS.VIEW_CHANNEL,
              Permissions.FLAGS.SEND_MESSAGES,
            ],
          },
        ];
        if (role !== "undefined") {
          overwrite.push({
            id: role,
            allow: [
              Permissions.FLAGS.VIEW_CHANNEL,
              Permissions.FLAGS.SEND_MESSAGES,
            ],
          });
        }
        if (category == "undefined") {
          newChannel = await interaction.guild.channels.create(
            `🎫｜${interaction.user.username}`,
            {
              type: "GUILD_TEXT",
              topic: interaction.user.id,
              permissionOverwrites: overwrite,
            }
          );
        } else {
          newChannel = await interaction.guild.channels.create(
            `🎫｜${interaction.user.username}`,
            {
              type: "GUILD_TEXT",
              parent: category,
              topic: interaction.user.id,
              permissionOverwrites: overwrite,
            }
          );
        }
        interaction.reply({
          content: `${newChannel.toString()}を作成しました`,
          ephemeral: true,
        });
        const del_embed = new MessageEmbed()
          .setDescription(
            "チケットを削除したい場合は下のボタンを押してください"
          )
          .setColor("RANDOM");
        const embeds = [del_embed];
        if (welcome != "undefined") {
          const info_embed = new MessageEmbed()
            .setDescription(welcome)
            .setColor("RANDOM");
          embeds.unshift(info_embed);
        }
        newChannel.send({
          content: `<@${interaction.user.id}>`,
          embeds: embeds,
          components: [
            newbutton([
              { id: "ifdelete", label: "チケットを削除", style: "DANGER" },
            ]),
          ],
        });
        if (role != "undefined") {
          const msg = await newChannel.send(`<@&${role.toString()}>`);
          setTimeout(function () {
            msg.delete();
          }, 3000);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (interaction.customId.startsWith("vending")) {
      const customId = `${
        interaction.customId
      }-${interaction.message.embeds[0].fields
        .map((field) => field.name.charAt(0))
        .join("/")}`;
      const modal = new Modal()
        .setCustomId(customId)
        .setTitle("購入情報入力フォーム")
        .addComponents(
          new TextInputComponent()
            .setCustomId("number")
            .setLabel("商品番号")
            .setStyle("LONG")
            .setPlaceholder("商品名の最初にある数字です\n(例:1.〇〇)\n数字のみを入力してください")
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("paypay")
            .setLabel("送金リンク")
            .setStyle("LONG")
            .setPlaceholder(
              "[PayPay] 受け取り依頼が届きました。下記リンクより、受け取りを完了してください。\n\nhttps://pay.paypay.ne.jp/0123456789abcdef"
            )
            .setRequired(true)
        );
      showModal(modal, {
        client: client,
        interaction: interaction,
      });
    }
    if (interaction.customId.startsWith("verify")) {
      const role = interaction.customId.split("-")[1];
      await interaction.member.roles
        .add(role)
        .then(() => {
          interaction.reply({ content: "認証が完了しました", ephemeral: true });
        })
        .catch((err) => {
          const embed = new MessageEmbed()
            .setTitle(`Error[ ${err.toString()} ]`)
            .setDescription(
              `M:${interaction.message.content}/${interaction.message.id}\nG:${interaction.message.guild.name}/${interaction.message.guild.id}\nC:${interaction.message.channel.name}/${interaction.message.channel.id}/<#${interaction.message.channel.id}>\nU:${interaction.message.author.username}/${interaction.message.author.id}/<@${interaction.message.author.id}>\n` +
                "```js\n" +
                err.stack +
                "```"
            )
            .setColor("RANDOM");
          interaction.reply({
            content: "エラーが発生しました\n管理者に問い合わせてください",
            embeds: [embed],
            ephemeral: true,
          });
        });
    }
    if (interaction.customId == "ifdelete") {
    if (!interaction.isButton()) return;
  
    const allowedRoleId = "1388759854738571268";
  
    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        ephemeral: true,
        content: "この操作を実行する権限がありません。",
      });
    }
  
    interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setTitle("チケットを閉じる")
          .setDescription(`本当にチケットを閉じますか？`)
          .setColor("RANDOM"),
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              customId: "delete",
              label: "閉じる",
              style: "SUCCESS",
            },
            {
              type: "BUTTON",
              customId: "cancel",
              label: "キャンセル",
              style: "DANGER",
            },
          ],
        },
      ],
    });
  }
    if (interaction.customId == "cancel") {
      const embed = new MessageEmbed()
        .setTitle("キャンセル")
        .setDescription(`チケットの削除をキャンセルしました`)
        .setColor("RANDOM");
      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
    if (interaction.customId == "delete") {
      const embed = new MessageEmbed()
        .setTitle("チケットを閉じる")
        .setDescription(`チケットを閉じます`)
        .setColor("RANDOM");
      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
      setTimeout(function () {
        interaction.channel.delete();
      }, 3000);
    }
    if (interaction.customId == "switch") {
      if (!interaction.member.permissions.has("ADMINISTRATOR"))
        return interaction.reply({
          content: "サーバー管理者しか使えません",
          ephemeral: true,
        });
      let content, color;
      const description = interaction.message.embeds[0].description;
      if (description == "現在対応可能です")
        (content = "現在対応不可能です"),
          (color = "RED"),
          (image =
            "https://aserora.net/batu.png");
      else if (description == "現在対応不可能です")
        (content = "現在対応可能です"),
          (color = "GREEN"),
          (image =
            "https://aserora.net/maru.png");
      const embed = new MessageEmbed()
        .setTitle("対応状況")
        .setDescription(content)
        .setImage(image)
        .setColor(color);
      await interaction.message.edit({
        embeds: [embed],
        components: [newbutton([{ id: "switch", emoji: "🔔" }])],
      });
      await interaction.deferUpdate();
    }
  } catch (e) {
    console.log(e);
  }
});

client.on("modalSubmit", async (interaction) => {
  try {
    console.log(interaction.customId);
    if (interaction.customId.startsWith("vending-")) {
      const [number, paypay] = ["number", "paypay"].map(
        (id) => interaction.getTextInputValue(id)
      );
      let link;
      const value = paypay.split(/\r\n|\n/g);
      for (let i in value) {
        if (value[i].match(/^https?:\/\/[^   ]/i)) {
          link = value[i];
        }
      }
      if (link == undefined)
        return interaction.reply({
          content: "PayPayの送金リンクが検出されませんでした",
          ephemeral: true,
        });
      const category = interaction.customId.split("-")[1];
      const role = interaction.customId.split("-")[2];
      const numbers = interaction.customId.split("-")[3].split("/");
      if (!numbers.includes(number))
        return interaction.reply({
          content: "登録されていない商品番号です",
          ephemeral: true,
        });

      let newChannel;

      const overwrites = [
        {
          id: interaction.user.id,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        },
      ];

      if (role !== "undefined") {
        overwrites.push({
          id: role,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        });
      }

      if (category === "undefined") {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      } else {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            parent: category,
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      }
      interaction.reply({
        content: `${newChannel.toString()}を作成しました。`,
        ephemeral: true,
      });
      const info_embed = new MessageEmbed()
        .setTitle("スタッフの対応をお待ちください")
        .addField("商品番号:", `>>> ${number}`)
        .addField("送金リンク:", `>>> ${link}`)
        .setColor("RANDOM");
      const del_embed = new MessageEmbed()
        .setDescription("チケットを削除したい場合は下のボタンを押してください")
        .setColor("RANDOM");
      newChannel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [info_embed, del_embed],
        components: [
          newbutton([
            { id: "ifdelete", label: "チケットを削除", style: "DANGER" },
          ]),
        ],
      });
      if (role != "undefined") {
        const msg = await newChannel.send(`<@&${role.toString()}>`);
        setTimeout(function () {
          msg.delete();
        }, 3000);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

client.on("error", (err) => {
  console.error("error");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "buymod") {
    const transactionNumber = generateRandomString(8);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("ダウンロード")
        .setURL(
          "https://www.mediafire.com/file/mvzkwpm1lhet42e/%25E3%2581%25B7%25E3%2581%25AB%25E3%2581%25B7%25E3%2581%25ABmod_4.123.0.apk/file"
        )
        .setStyle("LINK")
    );

    const embed = new MessageEmbed()
      .setTitle("ぷにぷにMODMENU 4.123.0")
      .setColor("RANDOM")
      .setDescription(`**取引番号:** ${transactionNumber}`)
      .setTimestamp();

    interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
    
    const role = '1267402430132519016';
    await interaction.member.roles.add(role);
    

    // ボタンを押したユーザーにDMでリンクと取引番号を送信
    interaction.user.send({
      content: `https://www.mediafire.com/file/mvzkwpm1lhet42e/%25E3%2581%25B7%25E3%2581%25AB%25E3%2581%25B7%25E3%2581%25ABmod_4.123.0.apk/file`,
      embeds: [embed],
    });

    const channelId = "1209002193617817670"; // 送信したいチャンネルのIDに置き換える

    const logMessage = `**購入ログ**
  
ぷにぷにMODmenuが購入されました
  
ユーザー: ${interaction.user.tag}
取引番号: ${transactionNumber}`;

    const channel = client.channels.cache.get(channelId);
    if (channel && channel.isText()) {
      channel.send({
        content: logMessage,
        embeds: [
          embed
            .setThumbnail(interaction.user.displayAvatarURL())
            .setColor("RANDOM")
            .setTimestamp(),
        ],
      });
    } else {
      console.log("指定したチャンネルが見つかりませんでした。");
    }
    console.log(`発行user: ${interaction.user.tag}`);
  }
});

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId == "script") {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setTitle("下記のメニューから発行したいスクリプトを選択してください")
          .setImage(
            "https://media.discordapp.net/attachments/1077075295431041205/1094432794760978463/1681003496419.png?width=1077&height=606"
          )
          .setColor("RANDOM")
          .addFields(
            {
              name: "➀ぷにぷに",
              value: "ぷにぷにスクリプトの購入が来た際発行してください",
            },
            {
              name: "➁ツムツム",
              value: "ツムツムスクリプトの購入が来た際発行してください",
            },
            {
              name: "③にゃんこ大戦争",
              value: "にゃんこ大戦争スクリプトの購入が来た際発行してください",
            }
          ),
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              customId: "puni",
              label: "①ぷにぷに",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "tumu",
              label: "②ツムツム",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "cat",
              label: "③にゃんこ大戦争",
              style: "PRIMARY",
            },
          ],
        },
      ],
    });
  }

  const customId = interaction.customId;

  if (interaction.customId === "mod") {
    interaction.reply({
      content:
        "https://www.mediafire.com/file/0ahducq7mv3mq8z/ぷにMOD_4.107.1.apk/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "tool") {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new MessageEmbed()
          .setTitle("下記のメニューから発行したいツールを選択してください")
          .setImage(
            "https://media.discordapp.net/attachments/1077075295431041205/1094432794760978463/1681003496419.png?width=1077&height=606"
          )
          .setColor("RANDOM")
          .addFields(
            {
              name: "➀業者パック",
              value: "業者パックの購入が来た際発行してください",
            },
            {
              name: "➁YouTube再生爆",
              value: "YouTube再生爆の購入が来た際発行してください",
            },
            {
              name: "③YouTube登録者爆",
              value: "YouTube登録者爆の購入が来た際発行してください",
            },
            {
              name: "④SMS認証回避",
              value: "SMS認証回避ツールの購入が来た際発行してください",
            }
          ),
      ],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              customId: "pack",
              label: "①業者パック",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "saiseibaku",
              label: "②YouTube再生爆",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "subbaku",
              label: "③YouTube登録者爆",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "sms",
              label: "④SMS認証回避",
              style: "PRIMARY",
            },
          ],
        },
      ],
    });
  }
  if (interaction.customId === "pack") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/0qmwf3wdfq4n7sw/%E6%A5%AD%E8%80%85%E3%83%91%E3%83%83%E3%82%AF.zip/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId === "saiseibaku") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/8nfucjpcxbiv1pj/Youtube%E5%86%8D%E7%94%9F%E7%88%86.zip/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId === "subbaku") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/bie6cotqo19b6mu/YouTube%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB%E7%99%BB%E9%8C%B2%E8%80%85%E7%88%86.zip/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId === "sms") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/wxnf4z5o1mbyjaq/SMS認証回避.zip/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "puni") {
    interaction.reply({
      ephemeral: true,
      embeds: [new MessageEmbed().setTitle("ぷにぷにスクリプト")],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              customId: "puni1",
              label: "通常",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "puni2",
              label: "永久",
              style: "PRIMARY",
            },
          ],
        },
      ],
    });
  }
  if (interaction.customId == "puni1") {
    await interaction.reply({
      content:
        "```パスワード：ruipuni06060```https://www.mediafire.com/file/4w4jo7f5nappdfr/%25E3%2581%25B7%25E3%2581%25AB%25E3%2581%25B7%25E3%2581%25AB%25E3%2582%25B9%25E3%2582%25AF%25E3%2583%25AA%25E3%2583%2597%25E3%2583%2588.ENC.lua/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "puni2") {
    await interaction.reply({
      content:
        "```パスワード：ruipuni06060```https://www.mediafire.com/file/uoc297d0qsb2n7b/%25E3%2581%25B7%25E3%2581%25AB%25E3%2581%25B7%25E3%2581%25AB%25E3%2582%25B9%25E3%2582%25AF%25E3%2583%25AA%25E3%2583%2597%25E3%2583%2588%25E6%25B0%25B8%25E4%25B9%2585.lua/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "tumu") {
    interaction.reply({
      ephemeral: true,
      embeds: [new MessageEmbed().setTitle("ツムツムスクリプト")],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              customId: "tumu1",
              label: "通常",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "tumu2",
              label: "永久",
              style: "PRIMARY",
            },
          ],
        },
      ],
    });
  }
  if (interaction.customId == "tumu1") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/qveatsa80ht54vs/%25E3%2583%2584%25E3%2583%25A0%25E3%2583%2584%25E3%2583%25A0%25E3%2582%25B9%25E3%2582%25AF%25E3%2583%25AA%25E3%2583%2597%25E3%2583%2588.ENC.lua/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "tumu2") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/m72zr230a3xzwjo/%25E3%2583%2584%25E3%2583%25A0%25E3%2583%2584%25E3%2583%25A0%25E3%2582%25B9%25E3%2582%25AF%25E3%2583%25AA%25E3%2583%2597%25E3%2583%2588%25E6%25B0%25B8%25E4%25B9%2585.lua/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "cat") {
    interaction.reply({
      ephemeral: true,
      embeds: [new MessageEmbed().setTitle("にゃんこスクリプト")],
      components: [
        {
          type: "ACTION_ROW",
          components: [
            {
              type: "BUTTON",
              customId: "n1",
              label: "通常",
              style: "PRIMARY",
            },
            {
              type: "BUTTON",
              customId: "n2",
              label: "永久",
              style: "PRIMARY",
            },
          ],
        },
      ],
    });
  }
  if (interaction.customId == "n1") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/3of1k5f1b5fjkkw/%25E3%2581%25AB%25E3%2582%2583%25E3%2582%2593%25E3%2581%2593%25E5%25A4%25A7%25E6%2588%25A6%25E4%25BA%2589%25E3%2582%25B9%25E3%2582%25AF%25E3%2583%25AA%25E3%2583%2597%25E3%2583%2588.ENC.lua/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "n2") {
    await interaction.reply({
      content:
        "https://www.mediafire.com/file/7yqh4802zojzamb/%25E3%2581%25AB%25E3%2582%2583%25E3%2582%2593%25E3%2581%2593%25E5%25A4%25A7%25E6%2588%25A6%25E4%25BA%2589%25E3%2582%25B9%25E3%2582%25AF%25E3%2583%25AA%25E3%2583%2597%25E3%2583%2588%25E6%25B0%25B8%25E4%25B9%2585.lua/file",
      ephemeral: true, // メッセージをephemeralにする
    });
  }
  if (interaction.customId == "taiou") {
    const embed = new MessageEmbed()
      .setTitle("対応に関して")
      .setDescription(
        `❶paypayを確認 ❷商品 + <#1142394464313294848> に実績記入お願いします と送信 ❸実績の記入と商品の受け取りが確認できたらチケットを削除`
      )
      .setColor("RANDOM");

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }

  if (interaction.customId == "daiou") {
    const embed = new MessageEmbed()
      .setTitle("代行依頼に関して")
      .setDescription(
        `❶依頼内容を確認 ❷paypayを確認 ❸ぷにぷにの場合メアパス、にゃんこの場合引き継ぎコードを確認 ❹RUIをメンション`
      )
      .setColor("RANDOM");

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) {
    return;
  }
  if (interaction.customId.startsWith("nyankodaikou")) {
    const customId = `${
      interaction.customId
    }-${interaction.message.embeds[0].fields
      .map((field) => field.name.charAt(0))
      .join("/")}`;
    const modal = new Modal()
      .setCustomId(customId)
      .setTitle("購入情報入力フォーム")
      .addComponents(
        new TextInputComponent()
          .setCustomId("number")
          .setLabel("依頼内容")
          .setStyle("LONG")
          .setPlaceholder("依頼内容を入力してください")
          .setRequired(true),
        new TextInputComponent()
          .setCustomId("paypay")
          .setLabel("送金リンク")
          .setStyle("LONG")
          .setPlaceholder(
            "[PayPay] 受け取り依頼が届きました。下記リンクより、受け取りを完了してください。\n\nhttps://pay.paypay.ne.jp/0123456789abcdef"
          )
          .setRequired(true),
        new TextInputComponent()
          .setCustomId("hikitugicode")
          .setLabel("引き継ぎコード")
          .setStyle("LONG")
          .setPlaceholder("abcdef12345")
          .setRequired(true),
        new TextInputComponent()
          .setCustomId("verifycode")
          .setLabel("認証コード")
          .setStyle("LONG")
          .setPlaceholder("1234")
          .setRequired(true)
      );
    showModal(modal, {
      client: client,
      interaction: interaction,
    });
  }
});

client.on("modalSubmit", async (interaction) => {
  console.log(interaction.customId);
  if (interaction.customId.startsWith("nyankodaikou-")) {
    const [number, paypay, hikitugicode, verifycode] = [
      "number",
      "paypay",
      "hikitugicode",
      "verifycode",
    ].map((id) => interaction.getTextInputValue(id));
    let link;
    const value = paypay.split(/\r\n|\n/g);
    for (let i in value) {
      if (value[i].match(/^https?:\/\/[^   ]/i)) {
        link = value[i];
      }
    }
    if (link == undefined)
      return interaction.reply({
        content: "PayPayの送金リンクが検出されませんでした",
        ephemeral: true,
      });
    if (hikitugicode == undefined)
      return interaction.reply({
        content: "引き継ぎコードが入力されませんでした",
        ephemeral: true,
      });
    if (verifycode == undefined)
      return interaction.reply({
        content: "認証コードが入力されませんでした",
        ephemeral: true,
      });
    const category = interaction.customId.split("-")[1];
    const role = interaction.customId.split("-")[2];
    const numbers = interaction.customId.split("-")[3].split("/");

    let newChannel;

    const overwrites = [
      {
        id: interaction.user.id,
        allow: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.SEND_MESSAGES,
        ],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
      },
    ];

    if (role !== "undefined") {
      overwrites.push({
        id: role,
        allow: [
          Permissions.FLAGS.VIEW_CHANNEL,
          Permissions.FLAGS.SEND_MESSAGES,
        ],
      });
    }

    if (category === "undefined") {
      newChannel = await interaction.guild.channels.create(
        `🎫｜${interaction.user.username}`,
        {
          type: "GUILD_TEXT",
          topic: interaction.user.id,
          permissionOverwrites: overwrites,
        }
      );
    } else {
      newChannel = await interaction.guild.channels.create(
        `🎫｜${interaction.user.username}`,
        {
          type: "GUILD_TEXT",
          parent: category,
          topic: interaction.user.id,
          permissionOverwrites: overwrites,
        }
      );
    }
    interaction.reply({
      content: `${newChannel.toString()}を作成しました。`,
      ephemeral: true,
    });
    const info_embed = new MessageEmbed()
      .setTitle("スタッフの対応をお待ちください")
      .addField("依頼内容:", `>>> ${number}`)
      .addField("送金リンク:", `>>> ${link}`)
      .addField("引き継ぎコード:", `>>> ${hikitugicode}`)
      .addField("認証コード:", `>>> ${verifycode}`)
      .setColor("RANDOM");
    const del_embed = new MessageEmbed()
      .setDescription("チケットを削除したい場合は下のボタンを押してください")
      .setColor("RANDOM");
    newChannel.send({
      content: `<@${interaction.user.id}>`,
      embeds: [info_embed, del_embed],
      components: [
        newbutton([
          { id: "ifdelete", label: "チケットを削除", style: "DANGER" },
        ]),
      ],
    });
    if (role != "undefined") {
      const msg = await newChannel.send(`<@&${role.toString()}>`);
      setTimeout(function () {
        msg.delete();
      }, 3000);
    }
  }
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "embed",
      description: "埋め込み生成",
      options: [
        {
          type: "STRING",
          name: "title",
          description: "タイトル",
        },
        {
          type: "STRING",
          name: "title_url",
          description: "タイトル(URL)",
        },
        {
          type: "STRING",
          name: "description",
          description: "デスクリプション",
        },
        {
          type: "STRING",
          name: "author_name",
          description: "アーサー",
        },
        {
          type: "STRING",
          name: "author_name_url",
          description: "アーサー(URL)",
        },
        {
          type: "ATTACHMENT",
          name: "author_icon",
          description: "アーサー(icon)",
        },
        {
          type: "STRING",
          name: "footer_text",
          description: "フーター",
        },
        {
          type: "ATTACHMENT",
          name: "footer_icon",
          description: "フーター(icon)",
        },
        {
          type: "STRING",
          name: "color",
          description: "色",
        },
        {
          type: "ATTACHMENT",
          name: "image",
          description: "画像",
        },
        {
          type: "ATTACHMENT",
          name: "thumbnail",
          description: "サムネイル",
        },
        {
          type: "BOOLEAN",
          name: "timestamp",
          description: "タイムスタンプ",
        },
        {
          type: "STRING",
          name: "field_title_1",
          description: "フィールドタイトル(1)",
        },
        {
          type: "STRING",
          name: "field_value_1",
          description: "フィールドバリュー(1)",
        },
        {
          type: "BOOLEAN",
          name: "field_inline_1",
          description: "フィールドインライン(1)",
        },
        {
          type: "STRING",
          name: "field_title_2",
          description: "フィールドタイトル(2)",
        },
        {
          type: "STRING",
          name: "field_value_2",
          description: "フィールドバリュー(2)",
        },
        {
          type: "BOOLEAN",
          name: "field_inline_2",
          description: "フィールドインライン(2)",
        },
        {
          type: "STRING",
          name: "field_title_3",
          description: "フィールドタイトル(3)",
        },
        {
          type: "STRING",
          name: "field_value_3",
          description: "フィールドバリュー(3)",
        },
        {
          type: "BOOLEAN",
          name: "field_inline_3",
          description: "フィールドインライン(3)",
        },
        {
          type: "STRING",
          name: "field_title_4",
          description: "フィールドタイトル(4)",
        },
        {
          type: "STRING",
          name: "field_value_4",
          description: "フィールドバリュー(4)",
        },
        {
          type: "BOOLEAN",
          name: "field_inline_4",
          description: "フィールドインライン(4)",
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "embed") {
      if (!interaction.member.permissions.has("ADMINISTRATOR"))
        return interaction.reply({
          content: "サーバー管理者しか使えません",
          ephemeral: true,
        });
      const embed = new MessageEmbed();
      const title = interaction.options.getString("title");
      const title_url = interaction.options.getString("title_url");
      const description = interaction.options.getString("description");
      const author_name = interaction.options.getString("author_name");
      const author_name_url = interaction.options.getString("author_name_url");
      const author_icon = interaction.options.getAttachment("author_icon");
      const footer_text = interaction.options.getString("footer_text");
      const footer_icon = interaction.options.getAttachment("footer_icon");
      const image = interaction.options.getAttachment("image");
      const thumbnail = interaction.options.getAttachment("thumbnail");
      const timestamp = interaction.options.getBoolean("timestamp");
      const color = interaction.options.getString("color");
      const field_title_1 = interaction.options.getString("field_title_1");
      const field_value_1 = interaction.options.getString("field_value_1");
      const field_inline_1 = interaction.options.getBoolean("field_inline_1");
      const field_title_2 = interaction.options.getString("field_title_2");
      const field_value_2 = interaction.options.getString("field_value_2");
      const field_inline_2 = interaction.options.getBoolean("field_inline_2");
      const field_title_3 = interaction.options.getString("field_title_3");
      const field_value_3 = interaction.options.getString("field_value_3");
      const field_inline_3 = interaction.options.getBoolean("field_inline_3");
      const field_title_4 = interaction.options.getString("field_title_4");
      const field_value_4 = interaction.options.getString("field_value_4");
      const field_inline_4 = interaction.options.getBoolean("field_inline_4");

      if (title) {
        embed.setTitle(title);
      }
      if (title_url) {
        embed.setURL(title_url);
      }
      if (description) {
        embed.setDescription(description);
      }
      if (author_name) {
        embed.setAuthor(
          author_name,
          author_icon ? author_icon.url : null,
          author_name_url
        );
      }
      if (footer_text) {
        embed.setFooter(footer_text, footer_icon ? footer_icon.url : null);
      }
      if (image) {
        embed.setImage(image.url);
      }
      if (thumbnail) {
        embed.setThumbnail(thumbnail.url);
      }
      if (timestamp) {
        embed.setTimestamp();
      }
      if (color) {
        try {
          embed.setColor(color.toUpperCase());
        } catch (err) {
          return interaction.reply({
            content:
              "無効な色の値が指定されました。有効な色の値を指定してください。",
            ephemeral: true,
          });
        }
      }
      if (field_title_1 && field_value_1) {
        embed.addField(field_title_1, field_value_1, field_inline_1);
      }
      if (field_title_2 && field_value_2) {
        embed.addField(field_title_2, field_value_2, field_inline_2);
      }
      if (field_title_3 && field_value_3) {
        embed.addField(field_title_3, field_value_3, field_inline_3);
      }
      if (field_title_4 && field_value_4) {
        embed.addField(field_title_4, field_value_4, field_inline_4);
      }

      try {
        await interaction.reply({ embeds: [embed] });
      } catch (err) {
        const errorEmbed = new MessageEmbed()
          .setTitle(`Error[ ${err.toString()} ]`)
          .setDescription(
            `G:${interaction.guild.name}/${interaction.guild.id}\n` +
              `C:${interaction.channel.name}/${interaction.channel.id}/<#${interaction.channel.id}>\n` +
              `U:${interaction.user.username}/${interaction.user.id}/<@${interaction.user.id}>\n` +
              "```js\n" +
              err.stack +
              "```"
          )
          .setColor("RANDOM");
        await interaction.reply({
          content: "エラーが発生しました\n管理者に問い合わせてください",
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "modpanel",
      description: "販売専用MODmenuパネル",
      options: [
        // オプションを追加することができます
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "modpanel") {
    const allowedRoleId = "1388759854738571268";
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        content: "このコマンドは特定のロールを持つメンバーのみ実行できます",
        ephemeral: true,
      });
    }

    const embed = new MessageEmbed()
      .setTitle("購入専用MODパネル")
      .setDescription(`<#1209001666465234954>に実績記入をお願いします`)
      .setAuthor(
        "R SERVER 販売用",
        "https://media.discordapp.net/attachments/1125145598199353374/1133005242825445396/download.png?width=512&height=512"
      )
      .setColor("RANDOM")
      .setTimestamp();

    const button1 = new MessageButton()
      .setCustomId("buymod")
      .setLabel("MODMENU発行")
      .setStyle("PRIMARY");

    const actionRow = new MessageActionRow().addComponents(button1);

    await interaction.reply({ embeds: [embed], components: [actionRow] });
  }
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "にゃんこ代行パネル",
      description: "にゃんこ代行",
      options: [
        {
          type: "CHANNEL",
          name: "カテゴリ",
          description: "チケットを作成するカテゴリ",
          channel_types: [4],
        },
        {
          type: "ROLE",
          name: "ロール",
          description: "チケット作成時にメンションするロール",
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "にゃんこ代行パネル") {
    const allowedRoleId = "1388759854738571268";
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        content: "このコマンドは特定のロールを持つメンバーのみ実行できます",
        ephemeral: true,
      });
    }

    const category = interaction.options.getChannel("カテゴリ") || "undefined",
      role = interaction.options.getRole("ロール") || "undefined";
    const embed = new MessageEmbed()
      .setTitle("にゃんこ大戦争代行")
      .setDescription(
        `引継ぎコードと認証コードに間違いがないようにしてください`
      )
      .addField(`1.猫缶 58000`, `> 150円`)
      .addField(`2.XPカンスト`, `> 400円`)
      .addField(`3.全ステージ解放`, `> 200円`)
      .addField(`4.全キャラ解放`, `> 400円`)
      .addField(`5.戦闘アイテムカンスト`, `> 400円`)
      .addField(`6.にゃんチケカンスト`, `> 200円`)
      .addField(`7.レアチケカンスト`, `> 350円`)
      .addField(`8.プラチナチケカンスト`, `> 500円`)
      .addField(`9.指定キャラ第3形態1体につき`, `> 150円`)
      .addField(`10.NPカンスト`, `> 300円`)
      .addField(`11.ステージ進行 1編につき`, `> 600円`)
      .addField(`12.レジェンドチケットカンスト`, `> 500円`)
    .addField(`13.マタタビ全種類カンスト`, `> 800円`)
.addField(`14.BAN保証`, `> 500円`)
.addField(`15.永久BAN保証`, `> 5000円`)
.addField(`16.永久猫缶補充`, `> 3000円`)
    .setImage("https://img.game8.jp/11627252/bee2cb864f9b7f4d43ac100e8daf5446.webp/show")
      .setColor("RANDOM");
    interaction.reply({
      embeds: [embed],
      components: [
        newbutton([
          {
            id: `nyankodaikou-${category.id}-${role.id}`,
            label: "購入",
            style: "SUCCESS",
          },
        ]),
      ],
    });
  }
});

client.once("ready", async () => {
    try {
      await client.application.commands.create({
        name: "ツムツム代行パネル",
        description: "ツムツム代行",
        options: [
          {
            type: "CHANNEL",
            name: "カテゴリ",
            description: "チケットを作成するカテゴリ",
            channel_types: [4],
          },
          {
            type: "ROLE",
            name: "ロール",
            description: "チケット作成時にメンションするロール",
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  });

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "ツムツム代行パネル") {
      const allowedRoleId = "1388759854738571268";
      const member = interaction.guild.members.cache.get(interaction.user.id);
  
      if (!member.roles.cache.has(allowedRoleId)) {
        return interaction.reply({
          content: "このコマンドは特定のロールを持つメンバーのみ実行できます",
          ephemeral: true,
        });
      }
  
      const category = interaction.options.getChannel("カテゴリ") || "undefined",
        role = interaction.options.getRole("ロール") || "undefined";
      const embed = new MessageEmbed()
        .setTitle("ツムツム代行")
        .setDescription(
          `メールアドレスとパスワードに間違いがないようにしてください`
        )
        .addField(`1.1億コイン`, `> 300円`)
.addField(`2.2億コイン`, `> 500円`)
.addField(`3.プレイヤーレベルMAX`, `> 400円`)
.addField(`4.セレクトボックス完売`, `> 500円`)
.addField(`5.プレミアムボックス完売`, `> 800円`)
.addField(`6.永久コイン補充`, `> 4000円`)
.addField(`7.BAN保証`, `> 500円`)
        .setColor("RANDOM");
      interaction.reply({
        embeds: [embed],
        components: [
          newbutton([
            {
              id: `tumutumudaikou-${category.id}-${role.id}`,
              label: "購入",
              style: "SUCCESS",
            },
          ]),
        ],
      });
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) {
      return;
    }
    if (interaction.customId.startsWith("tumutumudaikou")) {
      const customId = `${
        interaction.customId
      }-${interaction.message.embeds[0].fields
        .map((field) => field.name.charAt(0))
        .join("/")}`;
      const modal = new Modal()
        .setCustomId(customId)
        .setTitle("購入情報入力フォーム")
        .addComponents(
          new TextInputComponent()
            .setCustomId("number")
            .setLabel("依頼内容")
            .setStyle("LONG")
            .setPlaceholder("依頼内容を入力してください")
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("paypay")
            .setLabel("送金リンク")
            .setStyle("LONG")
            .setPlaceholder(
              "[PayPay] 受け取り依頼が届きました。下記リンクより、受け取りを完了してください。\n\nhttps://pay.paypay.ne.jp/0123456789abcdef"
            )
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("tumumail")
            .setLabel("メールアドレス")
            .setStyle("LONG")
            .setPlaceholder("abcdef@gmail.com")
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("tumupass")
            .setLabel("パスワード")
            .setStyle("LONG")
            .setPlaceholder("abc123")
            .setRequired(true)
        );
      showModal(modal, {
        client: client,
        interaction: interaction,
      });
    }
  });
  
  client.on("modalSubmit", async (interaction) => {
    console.log(interaction.customId);
    if (interaction.customId.startsWith("tumutumudaikou-")) {
      const [number, paypay, tumumail, tumupass] = [
        "number",
        "paypay",
        "tumumail",
        "tumupass",
      ].map((id) => interaction.getTextInputValue(id));
      let link;
      const value = paypay.split(/\r\n|\n/g);
      for (let i in value) {
        if (value[i].match(/^https?:\/\/[^   ]/i)) {
          link = value[i];
        }
      }
      if (link == undefined)
        return interaction.reply({
          content: "PayPayの送金リンクが検出されませんでした",
          ephemeral: true,
        });
      if (tumumail == undefined)
        return interaction.reply({
          content: "メールアドレスが入力されませんでした",
          ephemeral: true,
        });
      if (tumupass == undefined)
        return interaction.reply({
          content: "パスワードが入力されませんでした",
          ephemeral: true,
        });
      const category = interaction.customId.split("-")[1];
      const role = interaction.customId.split("-")[2];
      const numbers = interaction.customId.split("-")[3].split("/");
  
      let newChannel;
  
      const overwrites = [
        {
          id: interaction.user.id,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
        },
      ];
  
      if (role !== "undefined") {
        overwrites.push({
          id: role,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        });
      }
  
      if (category === "undefined") {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      } else {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            parent: category,
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      }
      interaction.reply({
        content: `${newChannel.toString()}を作成しました。`,
        ephemeral: true,
      });
      const info_embed = new MessageEmbed()
        .setTitle("スタッフの対応をお待ちください")
        .addField("依頼内容:", `>>> ${number}`)
        .addField("送金リンク:", `>>> ${link}`)
        .addField("メールアドレス:", `>>> ${tumumail}`)
        .addField("パスワード:", `>>> ${tumupass}`)
        .setColor("RANDOM");
      const del_embed = new MessageEmbed()
        .setDescription("チケットを削除したい場合は下のボタンを押してください")
        .setColor("RANDOM");
      newChannel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [info_embed, del_embed],
        components: [
          newbutton([
            { id: "ifdelete", label: "チケットを削除", style: "DANGER" },
          ]),
        ],
      });
      if (role != "undefined") {
        const msg = await newChannel.send(`<@&${role.toString()}>`);
        setTimeout(function () {
          msg.delete();
        }, 3000);
      }
    }
  });

  client.once("ready", async () => {
    try {
      await client.application.commands.create({
        name: "ぷにぷに代行パネル",
        description: "ぷにぷに代行",
        options: [
          {
            type: "CHANNEL",
            name: "カテゴリ",
            description: "チケットを作成するカテゴリ",
            channel_types: [4],
          },
          {
            type: "ROLE",
            name: "ロール",
            description: "チケット作成時にメンションするロール",
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  });

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "ぷにぷに代行パネル") {
      const allowedRoleId = "1388759854738571268";
      const member = interaction.guild.members.cache.get(interaction.user.id);
  
      if (!member.roles.cache.has(allowedRoleId)) {
        return interaction.reply({
          content: "このコマンドは特定のロールを持つメンバーのみ実行できます",
          ephemeral: true,
        });
      }
  
      const category = interaction.options.getChannel("カテゴリ") || "undefined",
        role = interaction.options.getRole("ロール") || "undefined";
      const embed = new MessageEmbed()
        .setTitle("ぷにぷに代行")
        .setDescription(`メールアドレスとパスワードに間違いがないようにしてください。ワイポ代行の際は強敵取得は無料です\n\n1.5万ワイポ 1000円\n2.10万ワイポ 1500円\n3.20万ワイポ 2500円\n4.30万ワイポ 3000円\n5.40万ワイポ 3500円\n6.50万ワイポ 4000円\n7.イベ終わりまで 8000円\n8.強敵取得 500円\n9.強敵完凸 1000円\n10.12時間周回 600円\n11.24時間周回 1200円\n12.取り巻き全撃破 300円\n13.ステージ進行 400円\n\nお支払い方法 PayPay`)
        .setColor("RANDOM");
      interaction.reply({
        embeds: [embed],
        components: [
          newbutton([
            {
              id: `punipunidaikou-${category.id}-${role.id}`,
              label: "購入",
              style: "SUCCESS",
            },
          ]),
        ],
      });
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) {
      return;
    }
    if (interaction.customId.startsWith("attention")) {
      const embed = new MessageEmbed()
      .setTitle("ぷにぷに代行を依頼する際の規約・注意事項")
      .setDescription(`1.BAN等のアカウントによる影響は一切の責任を負いかねます\n2.返金は致しかねます\nワイポ代行によるBANの確立が高まっているため、代行する際は自己責任でお願いします\nSTAFF一同BANという形にならないように最新の注意を払っておりますが、少しでも不安,危険だとお客様が感じた際には分けてのご依頼も可能です\n例: 30万依頼の際 今イベ20万弱 次イベ10万強\n代行中のログインは厳禁です`)
      .setColor("RED")
      .setTimestamp();
      await interaction.reply({ embeds: [embed],
          ephemeral: true,});
    }
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) {
      return;
    }
    if (interaction.customId.startsWith("punipunidaikou")) {
      const customId = `${
        interaction.customId
      }-${interaction.message.embeds[0].fields
        .map((field) => field.name.charAt(0))
        .join("/")}`;
      const modal = new Modal()
        .setCustomId(customId)
        .setTitle("購入情報入力フォーム")
        .addComponents(
          new TextInputComponent()
            .setCustomId("number")
            .setLabel("依頼内容")
            .setStyle("LONG")
            .setPlaceholder("依頼内容を入力してください")
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("paypay")
            .setLabel("送金リンク")
            .setStyle("LONG")
            .setPlaceholder(
              "[PayPay] 受け取り依頼が届きました。下記リンクより、受け取りを完了してください。\n\nhttps://pay.paypay.ne.jp/0123456789abcdef"
            )
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("punimail")
            .setLabel("メールアドレス")
            .setStyle("LONG")
            .setPlaceholder("abcdef@gmail.com")
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("punipass")
            .setLabel("パスワード")
            .setStyle("LONG")
            .setPlaceholder("abc123")
            .setRequired(true)
        );
      showModal(modal, {
        client: client,
        interaction: interaction,
      });
    }
  });
  
  client.on("modalSubmit", async (interaction) => {
    console.log(interaction.customId);
    if (interaction.customId.startsWith("punipunidaikou-")) {
      const [number, paypay, punimail, punipass] = [
        "number",
        "paypay",
        "punimail",
        "punipass",
      ].map((id) => interaction.getTextInputValue(id));
      let link;
      const value = paypay.split(/\r\n|\n/g);
      for (let i in value) {
        if (value[i].match(/^https?:\/\/[^   ]/i)) {
          link = value[i];
        }
      }
      if (link == undefined)
        return interaction.reply({
          content: "PayPayの送金リンクが検出されませんでした",
          ephemeral: true,
        });
      if (punimail == undefined)
        return interaction.reply({
          content: "メールアドレスが入力されませんでした",
          ephemeral: true,
        });
      if (punipass == undefined)
        return interaction.reply({
          content: "パスワードが入力されませんでした",
          ephemeral: true,
        });
      const category = interaction.customId.split("-")[1];
      const role = interaction.customId.split("-")[2];
      const numbers = interaction.customId.split("-")[3].split("/");
  
      let newChannel;
  
      const overwrites = [
        {
          id: interaction.user.id,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
        },
      ];
  
      if (role !== "undefined") {
        overwrites.push({
          id: role,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        });
      }
  
      if (category === "undefined") {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      } else {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            parent: category,
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      }
      interaction.reply({
        content: `${newChannel.toString()}を作成しました。`,
        ephemeral: true,
      });
      const info_embed = new MessageEmbed()
        .setTitle("スタッフの対応をお待ちください")
        .addField("依頼内容:", `>>> ${number}`)
        .addField("送金リンク:", `>>> ${link}`)
        .addField("メールアドレス:", `>>> ${punimail}`)
        .addField("パスワード:", `>>> ${punipass}`)
        .setColor("RANDOM");
      const del_embed = new MessageEmbed()
        .setDescription("チケットを削除したい場合は下のボタンを押してください")
        .setColor("RANDOM");
      newChannel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [info_embed, del_embed],
        components: [
          newbutton([
            { id: "ifdelete", label: "チケットを削除", style: "DANGER" },
          ]),
        ],
      });
      if (role != "undefined") {
        const msg = await newChannel.send(`<@&${role.toString()}>`);
        setTimeout(function () {
          msg.delete();
        }, 3000);
      }
    }
  });

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "panel",
      description: "対応状況パネルを設置",
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "panel") {
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
      return interaction.reply({
        content: "サーバー管理者しか使えません",
        ephemeral: true,
      });
    const embed = new MessageEmbed()
      .setTitle("対応状況")
      .setDescription("現在対応可能です")
      .setImage(
        "https://aserora.net/maru.png"
      )
      .setColor("GREEN");
    interaction.reply({
      embeds: [embed],
      components: [newbutton([{ id: "switch", emoji: "🔔" }])],
    });
  }
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "shop-create",
      description: "自販機を設置します",
      options: [
        {
          type: "STRING",
          name: "商品1-名前",
          description: "商品1の名前",
          required: true,
        },
        {
          type: "NUMBER",
          name: "商品1-値段",
          description: "商品1の値段",
          required: true,
        },
        {
          type: "STRING",
          name: "タイトル",
          description: "パネルのタイトル",
        },
        {
          type: "STRING",
          name: "概要",
          description: "パネルの概要",
        },
        {
          type: "ATTACHMENT",
          name: "画像",
          description: "パネルに乗せる画像",
        },
        {
          type: "CHANNEL",
          name: "カテゴリ",
          description: "チケットを作成するカテゴリ",
          channel_types: [4],
        },
        {
          type: "ROLE",
          name: "ロール",
          description: "チケット作成時にメンションするロール",
        },
        {
          type: "STRING",
          name: "商品2-名前",
          description: "商品2の名前",
        },
        {
          type: "NUMBER",
          name: "商品2-値段",
          description: "商品2の値段",
        },
        {
          type: "STRING",
          name: "商品3-名前",
          description: "商品3の名前",
        },
        {
          type: "NUMBER",
          name: "商品3-値段",
          description: "商品3の値段",
        },
        {
          type: "STRING",
          name: "商品4-名前",
          description: "商品4の名前",
        },
        {
          type: "NUMBER",
          name: "商品4-値段",
          description: "商品4の値段",
        },
        {
          type: "STRING",
          name: "商品5-名前",
          description: "商品5の名前",
        },
        {
          type: "NUMBER",
          name: "商品5-値段",
          description: "商品5の値段",
        },
        {
          type: "STRING",
          name: "商品6-名前",
          description: "商品6の名前",
        },
        {
          type: "NUMBER",
          name: "商品6-値段",
          description: "商品6の値段",
        },
        {
          type: "STRING",
          name: "商品7-名前",
          description: "商品7の名前",
        },
        {
          type: "NUMBER",
          name: "商品7-値段",
          description: "商品7の値段",
        },
        {
          type: "STRING",
          name: "商品8-名前",
          description: "商品8の名前",
        },
        {
          type: "NUMBER",
          name: "商品8-値段",
          description: "商品8の値段",
        },
        {
          type: "STRING",
          name: "商品9-名前",
          description: "商品9の名前",
        },
        {
          type: "NUMBER",
          name: "商品9-値段",
          description: "商品9の値段",
        },
        {
          type: "STRING",
          name: "商品10-名前",
          description: "商品10の名前",
        },
        {
          type: "NUMBER",
          name: "商品10-値段",
          description: "商品10の値段",
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "shop-create") {
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
      return interaction.reply({
        content: "サーバー管理者しか使えません",
        ephemeral: true,
      });
    let title = interaction.options.getString("タイトル"),
      description = interaction.options.getString("概要"),
      image = interaction.options.getAttachment("画像"),
      category = interaction.options.getChannel("カテゴリ") || "undefined",
      role = interaction.options.getRole("ロール") || "undefined";
    let name1 = interaction.options.getString("商品1-名前"),
      value1 = interaction.options.getNumber("商品1-値段"),
      name2 = interaction.options.getString("商品2-名前"),
      value2 = interaction.options.getNumber("商品2-値段"),
      name3 = interaction.options.getString("商品3-名前"),
      value3 = interaction.options.getNumber("商品3-値段"),
      name4 = interaction.options.getString("商品4-名前"),
      value4 = interaction.options.getNumber("商品4-値段"),
      name5 = interaction.options.getString("商品5-名前"),
      value5 = interaction.options.getNumber("商品5-値段"),
      name6 = interaction.options.getString("商品6-名前"),
      value6 = interaction.options.getNumber("商品6-値段"),
      name7 = interaction.options.getString("商品7-名前"),
      value7 = interaction.options.getNumber("商品7-値段"),
      name8 = interaction.options.getString("商品8-名前"),
      value8 = interaction.options.getNumber("商品8-値段"),
      name9 = interaction.options.getString("商品9-名前"),
      value9 = interaction.options.getNumber("商品9-値段"),
      name10 = interaction.options.getString("商品10-名前"),
      value10 = interaction.options.getNumber("商品10-値段");
    if (title == null) title = "自販機";
    if (description == null) description = "下のボタンを押すと購入できます。";
    const embed = new MessageEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor("RANDOM");
    if (image) embed.setImage(image.url);
    if (name1 && value1) embed.addField(`1.${name1}`, `> ${value1}円`);
    if (name2 && value2) embed.addField(`2.${name2}`, `> ${value2}円`);
    if (name3 && value3) embed.addField(`3.${name3}`, `> ${value3}円`);
    if (name4 && value4) embed.addField(`4.${name4}`, `> ${value4}円`);
    if (name5 && value5) embed.addField(`5.${name5}`, `> ${value5}円`);
    if (name6 && value6) embed.addField(`6.${name6}`, `> ${value6}円`);
    if (name7 && value7) embed.addField(`7.${name7}`, `> ${value7}円`);
    if (name8 && value8) embed.addField(`8.${name8}`, `> ${value8}円`);
    if (name9 && value9) embed.addField(`9.${name9}`, `> ${value9}円`);
    if (name10 && value10) embed.addField(`10.${name10}`, `> ${value10}円`);
    interaction.reply({
      embeds: [embed],
      components: [
        newbutton([
          {
            id: `vending-${category.id}-${role.id}`,
            label: "購入",
            style: "SUCCESS",
          },
        ]),
      ],
    });
  }
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "slot",
      description: "ユーザーを指定してslotを作成します",
      options: [
        {
          type: "USER",
          name: "ユーザー",
          description: "SLOTの使用者を指定",
          required: true,
        },
        {
          type: "CHANNEL",
          name: "カテゴリ",
          description: "スロットを作成するカテゴリを指定",
          channel_types: [4],
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "slot") {
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
      return interaction.reply({
        content: "サーバー管理者しか使えません",
        ephemeral: true,
      });
    const user = interaction.options.getUser("ユーザー");
    const category = interaction.options.getChannel("カテゴリ");
    if (category) {
      const newChannel = await interaction.guild.channels.create(
        `🎰｜${user.globalName ?? user.username}様`,
        {
          type: "GUILD_TEXT",
          parent: category.id,
          permissionOverwrites: [
            {
              id: user.id,
              allow: [
                Permissions.FLAGS.MENTION_EVERYONE,
                Permissions.FLAGS.SEND_MESSAGES,
              ],
            },
            {
              id: interaction.guild.roles.everyone,
              allow: [Permissions.FLAGS.VIEW_CHANNEL],
              deny: [Permissions.FLAGS.SEND_MESSAGES],
            },
          ],
        }
      );
      interaction.reply({
        content: `${newChannel.toString()}を作成しました。\n閲覧権限がeveryoneに付与されているので必要に応じて変更してください。`,
        ephemeral: true,
      });
    } else {
      const newCategory = await interaction.guild.channels.create("SLOTS", {
        type: "GUILD_CATEGORY",
      });
      const rule = await interaction.guild.channels.create(
        `🎰｜スロットルール`,
        {
          type: "GUILD_TEXT",
          parent: newCategory.id,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone,
              deny: [Permissions.FLAGS.SEND_MESSAGES],
            },
          ],
        }
      );
      const newChannel = await interaction.guild.channels.create(
        `🎰｜${user.globalName ?? user.username}様`,
        {
          type: "GUILD_TEXT",
          parent: newCategory.id,
          permissionOverwrites: [
            {
              id: user.id,
              allow: [
                Permissions.FLAGS.MENTION_EVERYONE,
                Permissions.FLAGS.SEND_MESSAGES,
              ],
            },
            {
              id: interaction.guild.roles.everyone,
              allow: [Permissions.FLAGS.VIEW_CHANNEL],
              deny: [Permissions.FLAGS.SEND_MESSAGES],
            },
          ],
        }
      );
      interaction.reply({
        content: `スロットカテゴリ、${rule.toString()}、${newChannel.toString()}を作成しました。\n閲覧権限がeveryoneに付与されているので必要に応じて変更してください。`,
        ephemeral: true,
      });
    }
  }
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "staffpanel",
      description: "スタッフパネル",
      options: [
        // オプションを追加することができます
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "staffpanel") {
    const allowedUserId = "1178414826184265819";
    if (interaction.user.id !== allowedUserId) {
      return interaction.reply({
        content: "このコマンドはBOTオーナーのみ実行できます",
        ephemeral: true,
      });
    }

    const embed = new MessageEmbed()
      .setDescription(`スタッフ専用パネル`)
      .setAuthor(
        "R SERVER 販売用 発行パネル",
        "https://media.discordapp.net/attachments/1125145598199353374/1133005242825445396/download.png?width=512&height=512"
      )
      .setColor("RANDOM")
      .setTimestamp();
    const button1 = new MessageButton()
      .setCustomId("script")
      .setLabel("スクリプト")
      .setStyle("PRIMARY");

    const button2 = new MessageButton()
      .setCustomId("mod")
      .setLabel("MODMENU")
      .setStyle("PRIMARY");

    const button3 = new MessageButton()
      .setCustomId("tool")
      .setLabel("ツール")
      .setStyle("PRIMARY");

    const button4 = new MessageButton()
      .setCustomId("taiou")
      .setLabel("対応について")
      .setStyle("PRIMARY");

    const button5 = new MessageButton()
      .setCustomId("daiou")
      .setLabel("代行依頼について")
      .setStyle("PRIMARY");

    const actionRow = new MessageActionRow().addComponents(
      button1,
      button2,
      button3,
      button4,
      button5
    );

    await interaction.reply({ embeds: [embed], components: [actionRow] });
  }
});

client.once("ready", async () => {
  try {
    await client.application.commands.create({
      name: "ticket",
      description: "チケットパネルを設置します",
      options: [
        {
          type: "STRING",
          name: "タイトル",
          description: "パネルのタイトル",
        },
        {
          type: "STRING",
          name: "概要",
          description: "パネルの概要",
        },
        {
          type: "ATTACHMENT",
          name: "画像",
          description: "パネルに乗せる画像",
        },
        {
          type: "CHANNEL",
          name: "カテゴリ",
          description: "チケットを作成するカテゴリ",
          channel_types: [4],
        },
        {
          type: "ROLE",
          name: "ロール",
          description: "チケット作成時にメンションするロール",
        },
        {
          type: "STRING",
          name: "最初に送るメッセージ",
          description: "チケット作成時に最初に送るメッセージ",
        },
      ],
    });
  } catch (error) {
    console.error(error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "ticket") {
    if (!interaction.member.permissions.has("ADMINISTRATOR"))
      return interaction.reply({
        content: "サーバー管理者しか使えません",
        ephemeral: true,
      });
    let title = interaction.options.getString("タイトル"),
      description = interaction.options.getString("概要"),
      image = interaction.options.getAttachment("画像"),
      category = interaction.options.getChannel("カテゴリ") || "undefined",
      role = interaction.options.getRole("ロール") || "undefined",
      welcome =
        interaction.options.getString("最初に送るメッセージ") || "undefined";
    if (title == null) title = "チケット作成";
    if (description == null)
      description = "下のボタンを押すとチケットを作成できます。";
    const embed = new MessageEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor("RANDOM");
    if (image) embed.setImage(image.url);
    interaction.reply({
      embeds: [embed],
      components: [
        newbutton([
          {
            id: `ticket-${category.id}-${role.id}-${welcome}`,
            label: "🎫発行",
            style: "SUCCESS",
          },
        ]),
      ],
    });
  }
});

const { URL, URLSearchParams } = require("url");
const uuid = require("uuid");
const { DateTime } = require("luxon");

function extractVerificationCode(url) {
  const parsedUrl = new URL(url);
  const pathSegments = parsedUrl.pathname.split("/");

  if (pathSegments.length > 1) {
    return pathSegments[pathSegments.length - 1];
  }

  const queryParams = parsedUrl.searchParams;
  if (queryParams.has("link_key")) {
    return queryParams.get("link_key");
  }

  return null;
}

client.on('messageCreate', async message => {
    if (message.content.startsWith('r-')) {
        const url = message.content.split(' ')[1];
        if (!url) {
            return message.reply('リンクを指定してください。');
        }

        const verificationCode = extractVerificationCode(url);
        if (!verificationCode) {
            return message.reply('有効なリンクを指定してください。');
        }

        const clientUuid = uuid.v4();
        const baseUrl = "https://www.paypay.ne.jp/app/v2/p2p-api/getP2PLinkInfo";
        const queryParams = {
            verificationCode: verificationCode,
            client_uuid: clientUuid
        };

        const pathHeaderValue = `/app/v2/p2p-api/getP2PLinkInfo?verificationCode=${verificationCode}&client_uuid=${clientUuid}`;
        const refererUrl = `https://www.paypay.ne.jp/app/p2p/${verificationCode}?pid=SMS&link_key=${verificationCode}`;

        const headers = {
            'authority': 'www.paypay.ne.jp',
            'method': 'GET',
            'path': pathHeaderValue,
            'scheme': 'https',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br', // axiosでの不具合防止のためzstdを外しています
            'Accept-Language': 'ja;q=0.9',
            'Referer': refererUrl,
            'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Gpc': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        };

        try {
            const response = await axios.get(baseUrl, {
                headers,
                params: queryParams
            });

            const data = response.data;
            const payload = data.payload || {};
            const pendingP2PInfo = payload.pendingP2PInfo || {};

            const amount = pendingP2PInfo.amount || 0;
            const expiredAt = pendingP2PInfo.expiredAt;
            const isSetPasscode = pendingP2PInfo.isSetPasscode || false;
            const dataInfo = payload.message?.data || {};
            const createdAt = pendingP2PInfo.createdAt || null;

            // ステータス判定
            let transactionStatus;
            switch (dataInfo.status) {
                case "COMPLETED":
                    transactionStatus = "受け取り済み";
                    break;
                case "CANCELLED":
                    transactionStatus = "キャンセル済み";
                    break;
                case "PENDING":
                    transactionStatus = "未受け取り";
                    break;
                default:
                    transactionStatus = "不明";
            }

            // 期限判定 (DateTime を使用)
            const currentTime = DateTime.now().toUTC();
            const expiredTime = expiredAt
                ? DateTime.fromISO(expiredAt).toUTC()
                : null;
            const isExpired = expiredTime ? expiredTime < currentTime : false;

            const senderInfo = payload.sender || {};
            const senderName = senderInfo.displayName || "Unknown";

            const subWalletSplit = dataInfo.subWalletSplit || {};
            const senderEmoneyAmount = subWalletSplit.senderEmoneyAmount || 0;
            const senderPrepaidAmount = subWalletSplit.senderPrepaidAmount || 0;

            const orderId = pendingP2PInfo.orderId || "Unknown";
            const userImageUrl = pendingP2PInfo.imageUrl || "";

            // 指定された形式のEmbed作成
            const embed = new MessageEmbed()
                .setColor('RED')
                .setThumbnail(userImageUrl)
                .setTitle('PayPayリンク情報')
                .addFields(
                    { name: 'ユーザー名', value: senderName, inline: true },
                    { name: '金額', value: `${amount} 円`, inline: true },
                    { name: 'PayPayマネー', value: `${senderEmoneyAmount} 円`, inline: true },
                    { name: 'PayPayマネーライト', value: `${senderPrepaidAmount} 円`, inline: true },
                    { name: '期限切れ', value: isExpired ? 'はい' : 'いいえ', inline: true },
                    { name: 'パスワード', value: isSetPasscode ? 'あり' : 'なし', inline: true },
                    { name: '受け取りの状態', value: transactionStatus, inline: true },
                    { name: '送信日時', value: createdAt
                        ? DateTime.fromISO(createdAt)
                            .setZone('Asia/Tokyo')
                            .toFormat('yyyy-MM-dd HH:mm:ss')
                        : '不明', inline: true },
                    { name: '決済番号', value: orderId, inline: true }
                )
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('取得失敗！！', error);
            message.reply('リンク情報の取得に失敗しました。');
        }
    }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content === "!channelcount") {
    await sendChannelCountEmbed(message.channel, message.author);
  }
});

async function sendChannelCountEmbed(channel, author) {
  const { embed, components } = generateChannelCountEmbed(author);
  const sentMessage = await channel.send({ embeds: [embed], components: [components] });

  setupCollector(sentMessage, author);
}

function setupCollector(message, author) {
  const filter = (interaction) => interaction.customId === "update_channelcount" && !interaction.user.bot;
  const collector = message.createMessageComponentCollector({ filter });

  collector.on("collect", async (interaction) => {
    await interaction.deferUpdate();

    const { embed, components } = generateChannelCountEmbed(author);
    await message.edit({ embeds: [embed], components: [components] });

    // 👇 ここで再帰的に `setupCollector` を呼び出して新しい collector を作る
    setupCollector(message, author);
  });
}

function generateChannelCountEmbed(author) {
  const categories = client.guilds.cache.first().channels.cache
    .filter((channel) => channel.type === "GUILD_CATEGORY")
    .sort((a, b) => a.rawPosition - b.rawPosition);

  let totalChannels = 0;
  let fields = [];

  categories.forEach((category) => {
    const channelCount = client.guilds.cache.first().channels.cache.filter(
      (ch) => ch.parentId === category.id
    ).size;
    totalChannels += channelCount;
    fields.push({ name: `📂 ${category.name}`, value: `${channelCount} チャンネル`, inline: true });
  });

  const uncategorizedChannels = client.guilds.cache.first().channels.cache.filter(
    (ch) => !ch.parentId && ch.type !== "GUILD_CATEGORY"
  ).size;
  totalChannels += uncategorizedChannels;

  const embed = new MessageEmbed()
    .setColor("#3498db")
    .setTitle("📊 サーバーチャンネル統計")
    .addFields(fields)
    .addField("📂 カテゴリーなし", `${uncategorizedChannels} チャンネル`, true)
    .addField("📊 総チャンネル数", `${totalChannels} チャンネル`, true)
    .setFooter({ text: `Requested by ${author.tag}`, iconURL: author.displayAvatarURL() })
    .setTimestamp();

  const components = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("update_channelcount")
      .setLabel("🔄 更新")
      .setStyle("PRIMARY")
  );

  return { embed, components };
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;
    if (message.content === "久垢販売") {
      if (message.author.id !== "1178414826184265819") {
      return message.channel.send("このコマンドを実行する権限がありません。");
    }
  
      const category = "1404828125753507880",
            role = "1388759857976442880",
            welcome = "久垢販売";
      const embed = new MessageEmbed()
        .setTitle("久垢販売")
        .setDescription(`商品番号,個数,送金リンクを入力してください`)
        .setImage(`https://cdn.discordapp.com/attachments/1404504406015086602/1433836618841718914/phonto.jpg?ex=690623e9&is=6904d269&hm=9bfc2d609550793e0dd00b31f3c1198db73cad3e8ddc3540b3d4a96686716123&`)
        .setColor("RANDOM");
      message.channel.send({
        embeds: [embed],
        components: [
          newbutton([
            {
              id: `hisaaka-${category}-${role}`,
              label: "購入",
              style: "SUCCESS",
            },
          ]),
          newbutton([
          {
            id: `tickethakkou-${category}-${role}-${welcome}`,
            label: "チケット発行",
            style: "SUCCESS",
          },
        ]),
        ],
      });
    }
  });

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) {
      return;
    }
    if (interaction.customId.startsWith("hisaaka")) {
      const customId = `${
        interaction.customId
      }-${interaction.message.embeds[0].fields
        .map((field) => field.name.charAt(0))
        .join("/")}`;
      const modal = new Modal()
        .setCustomId(customId)
        .setTitle("購入情報入力フォーム")
        .addComponents(
          new TextInputComponent()
            .setCustomId("number")
            .setLabel("商品番号")
            .setStyle("LONG")
            .setPlaceholder("商品番号(1から4)を入力してください")
            .setRequired(true),
          new TextInputComponent()
            .setCustomId("paypay")
            .setLabel("送金リンク")
            .setStyle("LONG")
            .setPlaceholder(
              "[PayPay] 受け取り依頼が届きました。下記リンクより、受け取りを完了してください。\n\nhttps://pay.paypay.ne.jp/0123456789abcdef"
            )
            .setRequired(true)
        );
      showModal(modal, {
        client: client,
        interaction: interaction,
      });
    }
  });

  client.on("modalSubmit", async (interaction) => {
    console.log(interaction.customId);
    if (interaction.customId.startsWith("hisaaka-")) {
      const [number, paypay] = [
        "number",
        "paypay",
      ].map((id) => interaction.getTextInputValue(id));
      let link;
      const value = paypay.split(/\r\n|\n/g);
      for (let i in value) {
        if (value[i].match(/^https?:\/\/[^   ]/i)) {
          link = value[i];
        }
      }
      if (link == undefined)
        return interaction.reply({
          content: "PayPayの送金リンクが検出されませんでした",
          ephemeral: true,
        });
      const category = interaction.customId.split("-")[1];
      const role = interaction.customId.split("-")[2];
      const numbers = interaction.customId.split("-")[3].split("/");
  
      let newChannel;
  
      const overwrites = [
        {
          id: interaction.user.id,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
        },
      ];
  
      if (role !== "undefined") {
        overwrites.push({
          id: role,
          allow: [
            Permissions.FLAGS.VIEW_CHANNEL,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        });
      }
  
      if (category === "undefined") {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      } else {
        newChannel = await interaction.guild.channels.create(
          `🎫｜${interaction.user.username}`,
          {
            type: "GUILD_TEXT",
            parent: category,
            topic: interaction.user.id,
            permissionOverwrites: overwrites,
          }
        );
      }
      interaction.reply({
        content: `${newChannel.toString()}を作成しました。`,
        ephemeral: true,
      });
      const info_embed = new MessageEmbed()
        .setTitle("久垢購入-アカウントスタッフの対応をお待ちください")
        .addField("商品番号", `>>> ${number}`)
        .addField("送金リンク:", `>>> ${link}`)
        .setColor("RANDOM");
      const del_embed = new MessageEmbed()
        .setDescription("チケットを削除したい場合は下のボタンを押してください")
        .setColor("RANDOM");
      newChannel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [info_embed, del_embed],
        components: [
          newbutton([
            { id: "ifdelete", label: "チケットを削除", style: "DANGER" },
          ]),
        ],
      });
      if (role != "undefined") {
        const msg = await newChannel.send(`<@&${role.toString()}>`);
        setTimeout(function () {
          msg.delete();
        }, 3000);
      }
    }
  });

process.on('uncaughtException', (error) => {
    console.error('未処理の例外:', error);
    fs.appendFileSync('error.log', `未処理の例外: ${error.stack}\n`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理の拒否:', reason);
    fs.appendFileSync('error.log', `未処理の拒否: ${reason}\n`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
