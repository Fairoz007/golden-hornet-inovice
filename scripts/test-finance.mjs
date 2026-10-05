import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
const out = mkdtempSync(join(tmpdir(), 'gh-finance-'))
const run = (command, args, env=process.env) => {
 const result=spawnSync(command,args,{stdio:'inherit',env})
 if(result.error)throw result.error
 if(result.status!==0)throw new Error(`${command} failed (${result.status})`)
}
try {
 run(resolve('node_modules/.bin/tsc'), ['tests/finance.test.ts','tests/finance-store.test.ts','tests/convex-finance.test.ts','--outDir',out,'--module','commonjs','--target','es2021','--esModuleInterop','--skipLibCheck'])
 const env={...process.env,NODE_PATH:resolve('node_modules')}
 for(const file of ['finance.test.js','finance-store.test.js','convex-finance.test.js'])run(process.execPath,[join(out,'tests',file)],env)
} finally {rmSync(out,{recursive:true,force:true})}
