<script lang="ts">
    import FileTransmitter from "./Components/Filetransmitter.svelte";
    import FileReciver from "./Components/Filereciver.svelte";
    let title = "p2file";
    let state = 0; 

    function loadPage(page: number) {
        switch(page) {
            case 1:
                state = 1;
                title = "p2file - transmit"
                break;
            case 2:
                state = 2;
                title = "p2file - Receive";
                break;
        }
    }
</script>

<svelte:head>
    <title>{title}</title>
    <meta http-equiv="Content-Security-Policy" content="script-src-elem 'self'">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</svelte:head>

<style>
    div.main {
        margin: 0 auto;
        margin-top: 300px;

        width: 340px;
        height: auto;
        border-radius: 19px;

        background-color: white;
    }
</style>

<div class="main is-flex is-align-items-center is-flex-direction-column is-centered">    
    {#if state == 0}
    <h2 class="has-text-primary title mt-2">P2File</h2>
    
    <button class="button is-primary" on:click={() => {loadPage(1)}}>Transmit</button>
    <button class="button is-primary is-light mt-2 mb-4" on:click={() => {loadPage(2)}}>Recive</button>
    {:else if state == 1}
    <FileTransmitter />
    {:else if state == 2}
    <FileReciver />
    {/if}
</div>
