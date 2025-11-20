const { getUser, addExp, updateUser } = require('../lib/userDb');

// --- KONFIGURASI GAMBAR RPG ---
// Ganti link di bawah ini dengan link gambar (JPG/PNG) yang kamu suka
const RPG_IMAGES = {
    profile: 'https://i.pinimg.com/564x/3d/15/60/3d156018f046c5b63c64002f43a45833.jpg', // Gambar Profil Galaxy
    adventure: 'https://i.pinimg.com/564x/31/21/29/3121294af4f4964659f925671d142861.jpg', // Gambar Hutan/Petualangan
    daily: 'https://i.pinimg.com/564x/7c/34/81/7c348119632d21910b182d6975638347.jpg', // Gambar Harta Karun
    inventory: 'https://i.pinimg.com/564x/55/7c/e1/557ce1f3a9948565de7c65e02c48416f.jpg', // Gambar Tas/Item
    heal: 'https://i.pinimg.com/564x/f8/09/31/f8093144d70950f84226c63b24f045d2.jpg'  // Gambar Rumah Sakit/Potion
};

// Helper waktu cooldown
const msToTime = (duration) => {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + " jam " + minutes + " menit " + seconds + " detik";
};

async function rpgCommand(sock, chatId, message, command, args, senderId, senderName) {
    const user = getUser(senderId, senderName);

    switch (command) {
        // 1. MENU UTAMA (PROFILE)
        case '.rpg':
        case '.menu-rpg':
        case '.profile':
            const textMenu = `
⋆｡˚ ☁︎ ˚｡⋆｡˚☽˚｡⋆  
*dear ${user.name},* ⟡ welcome to your soft galaxy journey ⟡  
⋆｡˚☽˚｡⋆｡˚☁︎˚｡⋆  

┊☾ 𝓙𝓞𝓤𝓡𝓝𝓔𝓨 ☽  
୨୧ nama: ${user.name} 
୨୧ status: ${user.limit <= 0 ? 'Exhausted' : 'Free'} 
୨୧ limit: ${user.limit} Ⓛ 
୨୧ health: ${user.health} / ${user.maxHealth}
୨୧ level: ${user.level}
୨୧ role: ${user.role}
୨୧ exp: ${user.exp}
୨୧ money: ${user.money.toLocaleString()}
୨୧ bank: ${user.bank.toLocaleString()}

┊☾ 𝓑𝓞𝓣 𝓢𝓟𝓐𝓒𝓔 ☽  
୨୧ nama bot: KnightBot  
୨୧ user id: ${senderId.split('@')[0]} 

┊☾ 𝓐𝓬𝓽𝓲𝓸𝓷𝓼 ☽  
୨୧ .adventure (Bertualang)
୨୧ .daily (Klaim Harian)
୨୧ .inv (Cek Tas)
୨୧ .heal (Obati Darah)
`;
            await sock.sendMessage(chatId, { 
                image: { url: RPG_IMAGES.profile },
                caption: textMenu
            }, { quoted: message });
            break;

        // 2. FITUR ADVENTURE (Bertualang)
        case '.adventure':
        case '.berpetualang':
            const cooldown = 5 * 60 * 1000; // 5 menit
            const lastAdv = user.lastAdventure;
            const timeDiff = Date.now() - lastAdv;

            if (timeDiff < cooldown) {
                const sisa = msToTime(cooldown - timeDiff);
                return await sock.sendMessage(chatId, { text: `⏳ *Cooldown Adventure*\nIstirahatlah sebentar, kamu bisa bertualang lagi dalam:\n*${sisa}*` }, { quoted: message });
            }

            const moneyGained = Math.floor(Math.random() * 5000) + 1000;
            const expGained = Math.floor(Math.random() * 300) + 50;
            const damageTaken = Math.floor(Math.random() * 30) + 5;
            const healthNow = user.health - damageTaken;

            if (healthNow <= 0) {
                 return await sock.sendMessage(chatId, { 
                     image: { url: RPG_IMAGES.heal }, // Tampilkan gambar heal saat mati
                     caption: `☠️ *YOU DIED*\n\nKamu mati saat bertualang karena kehabisan darah!\nGunakan *.heal* untuk hidup kembali.` 
                 }, { quoted: message });
            }

            updateUser(senderId, {
                money: user.money + moneyGained,
                health: healthNow,
                lastAdventure: Date.now()
            });
            addExp(senderId, expGained);

            const adventureText = `
⚔️ *ADVENTURE FINISHED* ⚔️

Kamu memasuki hutan kegelapan dan melawan monster...
💰 Money: +${moneyGained}
✨ Exp: +${expGained}
🩸 Darah: -${damageTaken} (Sisa: ${healthNow}/${user.maxHealth})

_Teruslah bertualang untuk menjadi yang terkuat!_
`;
            await sock.sendMessage(chatId, { 
                image: { url: RPG_IMAGES.adventure },
                caption: adventureText
            }, { quoted: message });
            break;

        // 3. FITUR DAILY (Harian)
        case '.daily':
        case '.claim':
            const dailyCd = 24 * 60 * 60 * 1000; 
            const lastDaily = user.lastDaily;
            const diffDaily = Date.now() - lastDaily;

            if (diffDaily < dailyCd) {
                const sisaDaily = msToTime(dailyCd - diffDaily);
                return await sock.sendMessage(chatId, { text: `⏳ *Daily Claim*\nKamu sudah mengambil jatah hari ini. Kembali lagi dalam:\n*${sisaDaily}*` }, { quoted: message });
            }

            const dailyMoney = 10000;
            const dailyExp = 500;

            updateUser(senderId, {
                money: user.money + dailyMoney,
                lastDaily: Date.now()
            });
            addExp(senderId, dailyExp);

            await sock.sendMessage(chatId, { 
                image: { url: RPG_IMAGES.daily },
                caption: `🎁 *DAILY REWARD* 🎁\n\nBerhasil mengklaim hadiah harian!\n💰 +${dailyMoney} Money\n✨ +${dailyExp} Exp\n\n_Gunakan uangmu dengan bijak!_` 
            }, { quoted: message });
            break;

        // 4. FITUR INVENTORY (Tas)
        case '.inv':
        case '.inventory':
        case '.tas':
            let invText = `👜 *INVENTORY ${user.name}*\n\n`;
            const inv = user.inventory;
            
            let isEmpty = true;
            // Format inventory agar lebih rapi
            for (const [item, count] of Object.entries(inv)) {
                if (count > 0) {
                    invText += `➤ *${item.toUpperCase()}*: ${count} pcs\n`;
                    isEmpty = false;
                }
            }

            if (isEmpty) {
                invText += "_Tas kamu kosong melompong..._\n_Ketik .adventure untuk mencari item!_";
            }

            await sock.sendMessage(chatId, { 
                image: { url: RPG_IMAGES.inventory },
                caption: invText 
            }, { quoted: message });
            break;
            
        // 5. FITUR HEAL (Berobat)
        case '.heal':
            if (user.money < 1000) return await sock.sendMessage(chatId, { text: '💸 Uang tidak cukup! Butuh 1.000 Money untuk berobat ke dokter.' }, { quoted: message });
            if (user.health >= user.maxHealth) return await sock.sendMessage(chatId, { text: '❤ Darah kamu masih penuh! Tidak perlu berobat.' }, { quoted: message });
            
            updateUser(senderId, {
                money: user.money - 1000,
                health: user.maxHealth
            });
            
            await sock.sendMessage(chatId, { 
                image: { url: RPG_IMAGES.heal },
                caption: `🚑 *HEALING CENTER*\n\nKamu dirawat oleh dokter tercantik...\n✅ Darah dipulihkan ke 100%\n💸 Biaya: 1.000 Money` 
            }, { quoted: message });
            break;
    }
}

module.exports = rpgCommand;