// ===== DonutSMP Dice Gambling (Universal JS Version) =====

// ====== ECONOMY (TEMP - MEMORY) ======
const users = new Map();

function getUser(userId) {
    if (!users.has(userId)) {
        users.set(userId, { balance: 1000000 });
    }
    return users.get(userId);
}

function getBalance(userId) {
    return getUser(userId).balance;
}

function addBalance(userId, amount) {
    getUser(userId).balance += amount;
}

function removeBalance(userId, amount) {
    getUser(userId).balance -= amount;
}

// ===== SETTINGS =====
const MIN_BET = 100000;
const MAX_BET = 1000000000;

// ===== COMMAND =====
module.exports = {

    name: "dice",

    // ===== RUN COMMAND =====
    async run(ctx) {
        const userId = ctx.user.id;
        const bet = Number(ctx.options.amount);

        if (!bet || bet < MIN_BET || bet > MAX_BET) {
            return ctx.reply(`❌ Bet must be between ${MIN_BET.toLocaleString()} and ${MAX_BET.toLocaleString()}`);
        }

        const balance = getBalance(userId);

        if (balance < bet) {
            return ctx.reply(`❌ Not enough donutsmp money.\n💰 Balance: ${balance.toLocaleString()}`);
        }

        return ctx.reply({
            content: `🍩 **DonutSMP Dice**\n💰 Bet: ${bet.toLocaleString()}\n\nPress roll to play!`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "🎲 Roll Dice",
                            style: 1,
                            custom_id: `roll_${userId}_${bet}`
                        },
                        {
                            type: 2,
                            label: "❌ Cancel",
                            style: 4,
                            custom_id: `cancel_${userId}`
                        }
                    ]
                }
            ]
        });
    },

    // ===== BUTTON HANDLER =====
    async handleButton(ctx) {
        const id = ctx.customId;
        const userId = ctx.user.id;

        // ===== ROLL =====
        if (id.startsWith("roll_")) {
            const [, ownerId, betStr] = id.split("_");
            const bet = Number(betStr);

            if (userId !== ownerId) {
                return ctx.reply("❌ This isn't your bet!");
            }

            const win = Math.random() < 0.4; // 40% win (house 60%)

            if (win) {
                addBalance(userId, bet);

                return ctx.update({
                    content: `🎉 YOU WON!\n💰 +${bet.toLocaleString()}\n🍩 Balance: ${getBalance(userId).toLocaleString()}`,
                    components: []
                });
            } else {
                removeBalance(userId, bet);

                return ctx.update({
                    content: `💀 YOU LOST!\n💸 -${bet.toLocaleString()}\n🍩 Balance: ${getBalance(userId).toLocaleString()}`,
                    components: []
                });
            }
        }

        // ===== CANCEL =====
        if (id.startsWith("cancel_")) {
            const [, ownerId] = id.split("_");

            if (userId !== ownerId) {
                return ctx.reply("❌ This isn't your bet!");
            }

            return ctx.update({
                content: "❌ Bet cancelled.",
                components: []
            });
        }
    }
};
