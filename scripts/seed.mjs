// Seed: copia src/data/restaurants.json a public/data para servirlo estáticamente si se necesita.
import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const src = path.join(root, 'src', 'data', 'restaurants.json')
const destDir = path.join(root, 'public', 'data')
const dest = path.join(destDir, 'restaurants.json')

await fs.mkdir(destDir, { recursive: true })
await fs.copyFile(src, dest)

console.log(`Seed OK: ${src} -> ${dest}`)
