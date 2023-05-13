const stunList = [
    "stun.l.google.com:19302",
    "stun1.l.google.com:19302",
    "stun2.l.google.com:19302",
    "stun3.l.google.com:19302",
    "stun4.l.google.com:19302"
]

export async function getIceServers(): Promise<RTCIceServer[]> {
    const response = await fetch("https://obli.metered.live/api/v1/turn/credentials?apiKey=45aaa45b64dfb9884aa3da9b7bd6531e0e9a");
    // Saving the response in the iceServers array
    const iceServers: RTCIceServer[] = await response.json();

    for (let i = stunList.length; i > 0; i--) { 
        iceServers.unshift({
            urls: `stun:${stunList[i - 1]}`
        })
    }

    return iceServers
}