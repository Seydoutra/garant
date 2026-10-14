import {createRequire} from "node:module";
import {spawn} from "node:child_process";
const require=createRequire(import.meta.url);
const child=spawn(process.execPath,[require.resolve("next/dist/bin/next"),"dev","--webpack","--hostname","127.0.0.1","--port","3000"],{stdio:"inherit",env:{...process.env,WATCHPACK_POLLING:"true"}});
for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>child.kill(signal));
child.on("exit",code=>{process.exitCode=code??1;});
child.on("error",()=>{process.stderr.write("Development server failed to start.\n");process.exitCode=1;});
