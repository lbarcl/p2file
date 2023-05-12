<script lang="ts">
    import Sender from "./Components/Sender.svelte";
    import Reciver from "./Components/Reciver.svelte";
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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
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

<div class="main is-flex is-align-items-center is-flex-direction-column">    
    {#if state == 0}
    <h2 class="has-text-primary title mt-2">P2File</h2>
    
    <button class="button is-primary" on:click={() => {loadPage(1)}}>Transmit</button>
    <button class="button is-primary is-light mt-2 mb-4" on:click={() => {loadPage(2)}}>Recive</button>
    {:else if state == 1}
    <Sender></Sender>
    {:else if state == 2}
    <Reciver></Reciver>
    {/if}
</div>
