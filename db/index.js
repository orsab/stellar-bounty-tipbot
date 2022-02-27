const fs = require("fs");
const DB_FILE = "./database.db";
const Database = require("sqlite-async");

class DB {
  db;
  instance

  static async getInstance(){
    if(!this.instance){
      this.instance = new DB()
      this.instance.db = await initDb()
    }

    return this.instance
  }

  async getMember(memberId) {
    const member = await db.get(`SELECT * FROM members WHERE id = $id`, {
      $id: memberId,
    });

    return member;
  };
  
  async linkMember(memberId, address) {
    const member = await this.getMember(memberId);

    if (member) {
      await db.run(`UPDATE members SET address = $address WHERE id = $id`, {
        $address: address,
        $id: memberId,
      });
    } else {
      await db.run(`INSERT INTO members (id,address) VALUES(?,?)`, [
        memberId,
        address,
      ]);
    }

    return await this.getMember(memberId)
  };

  async buyPackage(memberId, cost) {
    const member = await this.getMember(memberId);

    if(!member || Number(member.balance) + 0.1 < Number(cost)){
      throw new Error('Not enough balance')
    }

    if (member) {
      await db.run(`UPDATE members SET balance = balance - $cost WHERE id = $id`, {
        $cost: Number(cost),
        $id: memberId,
      });
    } else {
      throw new Error('Member not exists')
    }
  };

  async depositBalance(memberId, amount) {
    const member = await this.getMember(memberId);

    if (member) {
      await db.run(`UPDATE members SET balance = balance + $amount WHERE id = $id`, {
        $amount: Number(amount),
        $id: memberId,
      });
    } else {
      throw new Error('Member not exists')
    }
  };
};

const initDb = async () => {
  let isExist = true;

  if (!fs.existsSync(DB_FILE)) {
    isExist = false;
  }
  db = await Database.open(DB_FILE);

  if (!isExist) {
    await db.run(`
        CREATE TABLE IF NOT EXISTS members(
            id NVARCHAR(20) PRIMARY KEY NOT NULL,
            address NVARCHAR(70)
            );
            `);
    // await db.run(`
    //           CREATE UNIQUE INDEX members ON members(username);
    //           `);
  }

  return db;
};

module.exports = DB
