// import { Lock } from "redlock";

import { redLock } from "../config/redis.config";

export async function acquireLock(resource:string[],ttl:number) {
    const lock=await redLock.acquire(resource,ttl);
    console.log(`Lock acquired for resource: ${resource}`);
    return lock;
}

// export async function releaseLock(lock: Lock) {
//     await redLock.release(lock);
//     console.log('Lock released');
// }