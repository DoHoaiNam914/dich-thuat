'use strict'
import { readFile } from 'node:fs'
import { createServer } from 'node:http'
import { extname } from 'node:path'
const server = createServer((req, res) => {
  const fileUrl = /^\/(?:\?.*)?$/.test(req.url) ? '/index.html' : req.url
  const filePath = `src${fileUrl}`
  const ext = extname(filePath)
  const mimeTypes = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.ico': 'image/x-icon',
    '.js': 'application/javascript',
    '.json': 'application/json'
  }
  readFile(filePath, (err, data) => {
    if (err != null) {
      res.writeHead(500)
      res.end(`Server Error: ${err.code}`)
      return
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] ?? 'text/plain' })
    res.end(data)
  })
})
// starts a simple http server locally on port 3000
server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000')
})
