<script lang="ts">
    import { send } from "../Utils/sender";
    import { calculateEstimatedTimeOfArrival, calculateCompletionPercentage, chunkArrayBuffer, secondsToString } from "../Utils/helpers";
    export let dataChannel: RTCDataChannel;
    const CHUNK_SIZE = 4000;

    let files: FileList;
    
    let sentChunkCount: number = 0;
    let totalChunkCount: number;
    
    let eta: number;
    let percentage: number;
    let onProgress: boolean = false;
    let done: boolean = false;

    async function sendFile() {
        const file = files[0];

        const data = await file.arrayBuffer();
        const chunks = chunkArrayBuffer(data, CHUNK_SIZE);
        await send(dataChannel, JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
            totalChunkCount: chunks.length,
            chunkSize: CHUNK_SIZE
        }));

        onProgress = true;
        totalChunkCount = chunks.length;
        while (sentChunkCount !== chunks.length) {
            try {
                const timeBeforeSend = Date.now();
                await send(dataChannel, chunks[sentChunkCount]);
                sentChunkCount++;
                eta = calculateEstimatedTimeOfArrival(timeBeforeSend, Date.now(), CHUNK_SIZE, (totalChunkCount - sentChunkCount));
                percentage = calculateCompletionPercentage(sentChunkCount, totalChunkCount);
            } catch (error) {
                console.error(`Error sending chunk ${sentChunkCount}`, error);
            }
        }
        onProgress = false;
        done = true;
    }
</script>

<style>
    progress {
        width: 75%;
        height: 30px;
    }
</style>


{#if !onProgress && !done}
<div class="file is-primary has-name mx-4">
    <label class="file-label">
        <input class="file-input" type="file" name="resume" bind:files={files}>
        <span class="file-cta">
            <span class="file-icon">
                <i class="fas fa-upload"></i>
            </span>
            <span class="file-label">
                File to send
            </span>
        </span>
        <span class="file-name">
            {#if files?.length > 0}
            {files[0]?.name}
            {:else}
            Please choose a file
            {/if}
        </span>
    </label>
</div>


<button class="button is-primary is-light mt-2" on:click={sendFile}>Send</button>
{:else if onProgress && !done}
<p class="mx-4">Transmiting {files[0].name} | <strong>{secondsToString(eta / 1000)}</strong> Left | {Math.round(percentage)}%</p>
<progress class="progress is-primary" value={sentChunkCount} max={totalChunkCount}></progress>
{:else}
<p class="mx-4">Please don't close the window while the other peer secures the file</p>
{/if}