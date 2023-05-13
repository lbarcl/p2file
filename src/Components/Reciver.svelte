<script lang="ts">
    import { concatArrayBuffers, hexStringToArrayBuffer } from "../Utils/reciver";
    import { calculateEstimatedTimeOfArrival, calculateCompletionPercentage, secondsToString } from "../Utils/helpers";
    export let dataChannel: RTCDataChannel;
    const receivedChunks: ArrayBuffer[] = [];
    let receivedChunkCount: number = 0;
    let totalChunkCount: number;
    let fileMeta: fileMetaData = null;

    let eta: number;
    let percentage: number;
    let lastProgressUpdate: number;

    let metaDataReady: boolean = false;
    let onProgress: boolean = false;
    let done: boolean = false;

    let url: string;
    
    dataChannel.onmessage = onMessage;

    async function onMessage(event: MessageEvent) {
        try {
            const packet = JSON.parse(event.data);
            const packetId = packet.id;
            const packetData = packet.data;

            if (!metaDataReady) {
                // This is a metadata packet, ignore it
                //@ts-ignore
                fileMeta = JSON.parse(packetData);
                totalChunkCount = fileMeta.totalChunkCount;
                onProgress = true;
                metaDataReady = true;
            } else if (metaDataReady) {
                if (receivedChunkCount == 0) lastProgressUpdate = Date.now();

                // This is a chunk packet
                receivedChunks.push(hexStringToArrayBuffer(packetData));
                receivedChunkCount++;
                
                const now = Date.now();
                percentage = calculateCompletionPercentage(receivedChunkCount, totalChunkCount);
                eta = calculateEstimatedTimeOfArrival(lastProgressUpdate, now, fileMeta.chunkSize, (totalChunkCount - receivedChunkCount));
                lastProgressUpdate = now;

                // Check if we've received all the chunks
                if (receivedChunkCount === totalChunkCount) {
                    url = URL.createObjectURL(new Blob([new Uint8Array(concatArrayBuffers(receivedChunks))], {type: fileMeta.type}));
                    dataChannel.removeEventListener("message", onMessage);
                    onProgress = false;
                    done = true;
                }
            }

            dataChannel.send(JSON.stringify({id: packetId}));
        } catch (error) {
            console.error(`Error parsing packet:`, error);
        }
    }

    function onPressedSave() {
        setTimeout(() => {
            URL.revokeObjectURL(url);
            dataChannel.close();
        }, 10000);
    }

    interface fileMetaData { 
        name: string,
        type: string,
        size: number,
        totalChunkCount: number,
        chunkSize: number
    }
</script>

<style>
    progress {
        width: 75%;
        height: 30px;
    }
</style>

{#if !onProgress && !done} 
<p>Waiting for file</p>
<progress class="progress is-primary"></progress>
{:else if onProgress && !done}
<p>Receiving {fileMeta.name} | <strong>{secondsToString(eta / 1000)}</strong> Left | {Math.round(percentage)}%</p>
<progress class="progress is-primary" value={receivedChunkCount} max={totalChunkCount}></progress>
{:else}
<a class="tag is-primary" href={url} download={fileMeta.name} on:click={onPressedSave}>Save to computer</a>
{/if}