<script lang="ts">
    import { stunList } from "../Utils/rtconfig";
    import Signal from "../Class/signal";
    import Transmitter from "./Transmitter.svelte";

    let status = "Not connected";
    let state = 0;
    let roomId = "";

    let lc: RTCPeerConnection;
    let dataChannel: RTCDataChannel;
    let sg: Signal;
    let timeOut: NodeJS.Timeout;

    async function createRoom() {
      lc = window.RTCPeerConnection ? new RTCPeerConnection({ iceServers: stunList }) : null;

      if (!lc) {
        console.log("RTCPeerConnection not supported");
        alert("WebRTC is not supported!");
        return;
      }

      sg = new Signal();
      if (lc.onicecandidate !== undefined) {
        lc.onicecandidate = onIceCandidate;
      }
      lc.onnegotiationneeded = onNegotiationNeeded;

      //@ts-ignore
      sg.on("ice", ({ data }) => {
        if (data == null) return;

        const iceCandidate = new RTCIceCandidate(data);
        lc.addIceCandidate(iceCandidate);
      });

      createDataChannel();
    }

    function createDataChannel() {
      dataChannel = lc.createDataChannel("file", { ordered: true, maxRetransmits: 5 });

      dataChannel.onopen = () => {
        status = "Connected";
        state = 2;
        clearTimeout(timeOut);
      };

      dataChannel.onclose = () => {
        lc.close();
        sg.closeRoom();
        status = "Not connected";
        state = 0;
      };
    }

    async function onNegotiationNeeded() {
      try {
        state = 1;
        status = "Creating room";
        roomId = await sg.createRoom();

        await lc.setLocalDescription();
        status = "Waiting for other peer";
        const answerSDP = await sg.sendOffer(lc.localDescription.sdp);
        
        
        const answer = new RTCSessionDescription({ type: "answer", sdp: answerSDP });
        lc.setRemoteDescription(answer);
        status = "Connecting";
        state = 3;
        

        timeOut = setTimeout(() => {
          if (status == "Connecting") { 
            sg.closeRoom();
            dataChannel?.close();
            dataChannel = null;
            sg = null;
            lc = null;
            status = "Timeout";
            state = 0;
          }
        }, 120000)

      } catch (error) {
        console.error(error);
        status = "Error occurred";
      }
    }

    function onIceCandidate(e: RTCPeerConnectionIceEvent) {
      if (e.candidate != null) {
        sg.sendIce(JSON.stringify(e.candidate.toJSON()));
      }
    }

</script>

<style>
  .middle {
      width: 75%;
      height: 30px;
  }

  progress {
      width: 75%;
      height: 30px;
  }
</style>

<h2 class="has-text-primary title mt-2">Transmit</h2>

{#if state == 0}
<button class="button is-primary ml-2" on:click={createRoom}>Create room</button>
{:else if state == 1}
<input type="text" placeholder="Room ID" class="input has-text-white has-background-grey-dark middle" readonly bind:value={roomId}>
{:else if state == 2}
<Transmitter dataChannel={dataChannel} />
{:else if state == 3}
<progress class="progress is-primary" max="100"></progress>
{/if}

<p class="mt-2 mb-4">Status: <strong>{status}</strong></p>