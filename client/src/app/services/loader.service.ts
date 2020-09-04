import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LoaderService {
    private loadingIconSource   =   new BehaviorSubject(false);
    currentLoadingIconStatus    =   this.loadingIconSource.asObservable();

    private loadingMsgSource    =   new BehaviorSubject('');
    currentLoadingMsg           =   this.loadingMsgSource.asObservable();

    constructor() { }

    // Loader Icon
    showLoadingIcon(display: boolean) {
        this.loadingIconSource.next(display);
    }

    // Loading message
    updateLoadingMsg(message: string) {
        this.loadingMsgSource.next(message);
    }
}
