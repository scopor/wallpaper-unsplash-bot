{
  "version": 2,
  "builds": [
    {
      "src": "bot.js",
      "use": "@now/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "bot.js"
    }
  ]
}
