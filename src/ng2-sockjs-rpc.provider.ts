import {Injectable, NgZone} from '@angular/core';
import {Observable, Subject} from "rxjs";
import './sockjs-1.1.1.js';

declare let SockJS;

export interface IWebSocketMessage {
	responseKey: string;
	path: string;
	error: any;
	data: any;
}

export interface IRequest {
	path:string;
	responseKey:string;
	data:any;
}

export enum WSType {
	SOCKJS,
	WEBSOCKETS
}

/*
  Generated class for the Websockets provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SockJsRpcProvider {

	private socket: any;
	private address: string;
	private listeners: {[id: string]: any};
	private basicResponseKey: string;
	private waitingForResponse: {[id:string]: Subject<any>};
	private onConnectedSubject:Subject<any> = new Subject();
	private onCloseSubject: Subject<any> = new Subject();
	private onErrorSubject: Subject<any> = new Subject();
	private onMessageSubject: Subject<any> = new Subject();
	public onClose$:Observable<any> = this.onCloseSubject.asObservable();
	public onError$:Observable<any> = this.onErrorSubject.asObservable();
	public onMessage$:Observable<any> = this.onMessageSubject.asObservable();

	constructor(public ngZone: NgZone) {
		this.listeners = {};
		this.waitingForResponse = {};
	}

	public connect(address:string, type:WSType = WSType.SOCKJS) {
		let that = this;
		this.address = address;
		switch (type) {
			case WSType.WEBSOCKETS:
				this.socket = new WebSocket(address);
				break;
			case WSType.SOCKJS:
				this.socket = new SockJS(address);
				break;
			default:
				this.socket = new SockJS(address);
		}
		this.socket.onopen = e => that.ngZone.run(() => that.onOpen());
		this.socket.onmessage = e => that.ngZone.run(() => that.onMessage(e));
		this.socket.onclose = e => that.ngZone.run(() => that.onClose());
		if(type == WSType.WEBSOCKETS) {
			this.socket.onerror = e => that.ngZone.run(() => that.onError(e));
		}

		return this.onConnectedSubject.asObservable();
	}

	public call(path:string, data:any) {
		let responseKey:string = this.createResponseKey();
		let responseSubject:Subject<any> = new Subject();
		this.waitingForResponse[responseKey] = responseSubject;
		let request:IRequest = {
			path: path,
			responseKey: responseKey,
			data: data
		};
		this.socket.send(JSON.stringify(request));
		return responseSubject.asObservable();
	}

	public register(name:string, instance:any) {
		if (this.listeners[name] == null) {
			this.listeners[name] = instance;
		} else {
			throw new Error("Listener with this name already registered.");
		}
	}

	public unregister(name:string) {
		if (this.listeners[name] == null) {
			throw new Error("Listener with this name is not registered");
		} else {
			this.listeners[name] = undefined;
		}
	}

	private onOpen() {
	}

	private onError(evt) {
		this.onErrorSubject.next(evt);
	}

	private onMessage(e) {
		this.onMessageSubject.next(e);
		let jsonMessage:IWebSocketMessage = JSON.parse(e.data);
		if(jsonMessage.responseKey != null) {
			this.invokeResponse(jsonMessage);
		} else if(jsonMessage.path != null) {
			if(jsonMessage.path = "createResponseKey") {
				this.basicResponseKey = jsonMessage.data;
				this.onConnectedSubject.next();
			} else {
				this.invokeListener(jsonMessage);
			}
		}
	}

	private invokeResponse(message:IWebSocketMessage) {
		let callSubject: Subject<any> = this.waitingForResponse[message.responseKey];
		if(callSubject) {
			if(message.error != null) {
				callSubject.error(message.error);
			} else {
				callSubject.next(message.data);
			}
		} else {
			console.warn("No call subject found");
		}
	}

	private invokeListener(message:IWebSocketMessage) {
		let path:Array<string> = message.path.split('.');
		if(path.length != 2) {
			throw new Error("Can't identify listener method");
		}  else {
			let listener: any = this.listeners[path[0]];
			if (listener) {
				try {
					listener[path[1]](message.data, message);
				} catch(ex) {
					throw new Error("Can' identify listener method")
				}
			} else {
				throw new Error("Can't identify listener");
			}
		}
	}

	private onClose() {
		this.onCloseSubject.next();
	}

	private createResponseKey():string {
		let rand:string = this.generateString();
		return btoa(this.basicResponseKey + rand);
	}

	private generateString():string {
		let text = "";
		let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( let i=0; i < 10; i++ ) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	}
}
