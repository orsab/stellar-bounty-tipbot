require('dotenv').config()

const sdk = require('stellar-sdk')
const stellar = require("./stellar").getInstance();

const issuer = {
    public: 'GCJA25XLLL2CZ2UEHTBM7EYJWPIVT7C36TD5H55SKYOUZIVT5WZI35OJ',
    secret: 'SDYNMW2F3ODYBMLN6P7FTJ7D4VDNHWKVJQL4HGBTRHREEFWFJECTZLIK'
}
const distributor = {
    public: 'GBSA2PWEPRVILYGCUS5OAN2CONFUNO7GST55MCU5FZJZZQUGPQJE5MFW',
    secret: 'SDUIVTK4F4G5N5SU3DOZGXD7WZKGOQK2ZQAMBEMRR2LP5AS44J5PML6N'
}

const asset = new sdk.Asset('BEAR', issuer.public)

const start = async () => {
    await stellar.setTrustline(distributor.public, distributor.secret, asset)
    await stellar.payment(issuer.public,issuer.secret, distributor.public, '1000000', asset)
}

start()