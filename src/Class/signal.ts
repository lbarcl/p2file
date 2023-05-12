import Pusher, { Channel } from "pusher-js";
import { EventEmitter } from "./eventemitter";

class Signal extends EventEmitter{
  	private pusher: Pusher;
	private channel: Channel;
	private signallingServer = "https://webrtc-signal.proxifi.ga";
	private socketId: string;
	roomId: string;
	constructor() {
		super();
      	this.pusher = new Pusher("0992570237d9aef38843", {
          	cluster: "eu",
          	forceTLS: true
		});
		this.pusher.connect();
		this.socketId = this.pusher.connection.socket_id;
  	}

  	async createRoom(): Promise<string> {
		const response = await fetch(`${this.signallingServer}/rooms/create`, { method: "POST" });
		const id = await response.text();
		this.subscribeToChannel(id);
  		return id
	}
	
	async sendOffer(offer: string): Promise<string> {
		fetch(`${this.signallingServer}/rooms/${this.roomId}/offer`, { method: "POST", body: offer });
		const response = await fetch(`${this.signallingServer}/rooms/${this.roomId}/answer`);
		return (await response.text());
	}

	async getOffer(id: string): Promise<string> { 
		this.subscribeToChannel(id);
		const response = await fetch(`${this.signallingServer}/rooms/${id}/offer`);
		return (await response.text());
	}

	sendAnswer(answer: string) { 
		fetch(`${this.signallingServer}/rooms/${this.roomId}/answer`, { method: "POST", body: answer });
	}

	sendIce(ice: string) {
		fetch(`${this.signallingServer}/rooms/${this.roomId}/ice?socketID=${this.socketId}`, { method: "POST", body: ice });
	}

	async closeRoom() {
		fetch(`${this.signallingServer}/rooms/${this.roomId}`, {method: "DELETE"})
	}
		
	private subscribeToChannel(id: string) {
		this.roomId = id;
		this.channel = this.pusher.subscribe(`cache-${id}`);
		this.socketId = this.pusher.connection.socket_id;
		this.channel.bind("ice", (ice) => {
			this.emit("ice", ice);
		})
	}	
}

export default Signal
