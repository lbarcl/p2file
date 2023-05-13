<script lang="ts">
    import { getIceServers } from "../Utils/rtconfig";
    import Signal from "../Class/signal";
    import Reciver from "./Rx.svelte";

    let status = "Not connected";
    let state = 0;
    let roomId = "";

    let lc: RTCPeerConnection;
    let dataChannel: RTCDataChannel;
    let sg: Signal;
    let timeOut: NodeJS.Timeout;

    async function connect() {
      if (!roomId) {
        alert("Please enter roomId");
        return;
      }

      const iceServers = await getIceServers();
      lc = window.RTCPeerConnection ? new RTCPeerConnection({ iceServers }) : null;
      if (!lc) {
        console.log("RTCPeerConnection not supported");
        alert("WebRTC is not supported!");
        return;
      }

      if (lc.onicecandidate !== undefined) {
        lc.onicecandidate = onIceCandidate;
      }
      
      sg = new Signal();
      status = "Connecting";
      state = 1;

      try {
        const offerSDP = await sg.getOffer(roomId);
        const offer = new RTCSessionDescription({ type: "offer", sdp: offerSDP });
        await lc.setRemoteDescription(offer);
        
        const answer = await lc.createAnswer();
        await lc.setLocalDescription(answer);
        sg.sendAnswer(answer.sdp);
        

        timeOut = setTimeout(() => {
          if (status == "Connecting") { 
            sg = null;
            lc = null;
            status = "Timeout";
            state = 0;
          }
        }, 120000)

        lc.ondatachannel = onDataChannel;

        //@ts-ignore
        sg.on("ice", ({ data }) => {
          if (data == null || lc.remoteDescription == null) return;

          const iceCandidate = new RTCIceCandidate(data);
          lc.addIceCandidate(iceCandidate);
        });

      } catch (error) {
        console.error(error);
        status = "Error occurred";
      }
    }

    function onDataChannel({ channel }) {
      dataChannel = channel;
      dataChannel.onopen = () => {
        status = "Connected";
        state = 2;
        clearTimeout(timeOut);
      };
      dataChannel.onclose = () => {
        lc.close();
        status = "Not connected";
        state = 0;
      };
    }

    function onIceCandidate(e: RTCPeerConnectionIceEvent) {
        if (e.candidate != null) {
            console.log(e.candidate);
            sg.sendIce(JSON.stringify(e.candidate.toJSON()));
        }
    }

</script>

<style>
  progress {
      width: 75%;
      height: 30px;
  }
</style>

<h2 class="has-text-primary title mt-2">Receive</h2>


{#if state == 0}
<div class="is-flex is-flex-direction-row">
    <input type="text" placeholder="Room ID" class="input has-text-white has-background-grey-dark" bind:value={roomId}>
    <button class="button is-primary ml-2" on:click={connect}>Connect</button>
</div>
{:else if state == 1}
<progress class="progress is-primary" max="100">15%</progress>
{:else if state == 2}
<Reciver dataChannel={dataChannel} />
{/if}

<p class="ml-2 mb-4">Status: <strong>{status}</strong></p>