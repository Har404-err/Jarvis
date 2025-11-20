const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/users.json');

if (!fs.existsSync(path.join(__dirname,'../data'))) {
  fs.mkdir(path.join(__dirname,'../data'))
}

let users = {};
if (fs.existsSync(dbPath)){
  users = JSON.parse(fs.readFileSync(dbPath));
}

const saveUsers = () => {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

const getUser = (senderId, senderName) => {
  if (!users[senderId]) {
    users[ssenderId] = {
                  name: senderName,
            limit: 100,
            health: 200,
            maxHealth: 200,
            level: 0,
            role: 'Newbie ㋡',
            exp: 0,
            money: 0,
            bank: 0,
            lastDaily: 0,
            lastAdventure: 0,
            inventory: {
                potion: 0,
                iron: 0,
                fish: 0
            }
    };
    saveUsers();
  }
  return users[senderId];
}

// Fungsi Helper
const addExp = (senderId, amount) => {
    users[senderId].exp += amount;
    // Logika Level Up sederhana (Exp / 1000)
    const newLevel = Math.floor(users[senderId].exp / 1000);
    if (newLevel > users[senderId].level) {
        users[senderId].level = newLevel;
        users[senderId].money += 10000; // Bonus naik level
        users[senderId].limit += 10;
    }
    saveUsers();
};

const updateUser = (senderId, data) => {
    users[senderId] = { ...users[senderId], ...data };
    saveUsers();
};

module.exports = { getUser, saveUsers, addExp, updateUser, users };