import {Injectable} from "@angular/core";
import * as signalR from "@microsoft/signalr";
import {environment} from "../environments/environment";
import {Observable, Subject} from "rxjs";

@Injectable({providedIn: 'root'})
export class NotificationService {

	public navwarningsUpdateObservable: Observable<void>;
	public trackingUpdateObservable: Observable<void>;

	private navwarningsUpdateSubject: Subject<void>;
	private trackingUpdateSubject: Subject<void>;

	constructor() {
		this.navwarningsUpdateSubject = new Subject<void>();
		this.navwarningsUpdateObservable = this.navwarningsUpdateSubject.asObservable();
		this.trackingUpdateSubject = new Subject<void>();
		this.trackingUpdateObservable = this.trackingUpdateSubject.asObservable();

		let connection = new signalR.HubConnectionBuilder()
			.withUrl(`${environment.apiBaseUrl}/notificationHub`)
			.build();

		connection.on('onNavwarningsUpdate', () => this.navwarningsUpdateSubject.next());
		connection.on('onTrackingUpdate', () => this.trackingUpdateSubject.next());

		connection.start().then(() => {
			console.log('connected to signlar hub');
		}).catch(error => {
			console.error('Error conencing to signalr hub: ', {error});
		});
	}
}
