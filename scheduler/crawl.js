#!/usr/bin/env node
const admin = require('firebase-admin')
const UpdateDB = require('./updatedb')
require('dotenv').config()

function initAdmin(admin) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: JSON.parse(process.env.FIREBASE_PRIVATE_KEY_RAW)
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  })
}

async function main() {
  console.log(`start crawl : ${new Date()}`)
  console.log('-----------------------------------------------')
  initAdmin(admin)

  await UpdateDB.update(admin).catch((err) => { console.log(err) })

  console.log('-----------------------------------------------')
  console.log(`finish crawl : ${new Date()}`)
  process.exit(0)
}

main()
