const MAX_RETRIES = 3;
const TIMEOUT_MS = 5000;

export async function send(dataChannel: RTCDataChannel, data: string | ArrayBuffer | ArrayBufferView | Blob, retries: number = 0): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const packetId = randomIDGen(10);

        if (typeof data !== 'string') { 
            //@ts-ignore
            data = arrayBufferToHexString(data);
        }
        const packet = { id: packetId, data };
        const packetString = JSON.stringify(packet);
        dataChannel.send(packetString);
        
        const timeoutId = setTimeout(() => {
            if (retries < MAX_RETRIES) {
                console.warn(`Packet ${packetId} timed out, retrying...`);
                send(dataChannel, data, retries + 1).then(resolve, reject);
            } else {
                console.error(`Packet ${packetId} timed out and max retries exceeded.`);
                reject(new Error(`Packet ${packetId} timed out and max retries exceeded.`));
            }
        }, TIMEOUT_MS);
      
        const ackListener = (event: MessageEvent) => {
            try {
                const ack = JSON.parse(event.data);
                if (ack.id === packetId) {
                  clearTimeout(timeoutId);
                  dataChannel.removeEventListener("message", ackListener);
                  resolve(true);
                }
            } catch (error) {
                console.error(`Error parsing ack message for packet ${packetId}:`, error);
            }
        };
      
        dataChannel.addEventListener("message", ackListener);
    });
}

export function randomIDGen(length: number): string {
    const chars = "1234567890QWERTUIOPASDFGHJKLZXCVBNMqwertyuıopasdfghjklzxcvbnm"
    let str = ""
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)]
    }
    return str;
}

export function arrayBufferToHexString(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let hexString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      const hexByte = uint8Array[i].toString(16).padStart(2, '0');
      hexString += hexByte;
    }
    return hexString;
}