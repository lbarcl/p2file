export function chunkArrayBuffer(buffer: ArrayBuffer, chunkSize: number): ArrayBuffer[] {
    const chunks: ArrayBuffer[] = [];
    const byteArray = new Uint8Array(buffer);
    let i = 0;
    while (i < byteArray.length) {
        chunks.push(buffer.slice(i, i + chunkSize));
        i += chunkSize;
    }
    return chunks;
}

export function calculateCompletionPercentage(sentSize: number, totalSize: number): number {
    const completionPercentage = (sentSize / totalSize) * 100;
    return completionPercentage;
}

export function calculateEstimatedTimeOfArrival(startTime: number, endTime: number, chunkSize: number, remainingChunks: number): number {
    const elapsedTime = endTime - startTime;
    const remainingBytes = remainingChunks * chunkSize;
    return (elapsedTime * remainingBytes) / chunkSize;
}

export function secondsToString(seconds: number): string { 
    let minute = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
  
    let hour = Math.floor(minute / 60);
    minute = Math.floor(minute % 60);
  
    let sstr = (seconds < 10) ? `0${seconds}` : seconds;
    let mstr = (minute < 10) ? `0${minute}` : minute;
    let hstr = (hour < 10) ? `0${hour}` : hour;
  
    return (hour != 0) ? `${hstr}:${mstr}:${sstr}`: `${mstr}:${sstr}`;
}