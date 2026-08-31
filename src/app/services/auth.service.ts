import { Injectable, OnDestroy } from '@angular/core';

import {
  MsalBroadcastService,
  MsalService
} from '@azure/msal-angular';

import {
  AccountInfo,
  EventMessage,
  EventType,
  InteractionStatus
} from '@azure/msal-browser';

import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {

  private readonly destroying$ = new Subject<void>();

  constructor(
    private readonly msalService: MsalService,
    private readonly msalBroadcastService: MsalBroadcastService
  ) {

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.LOGIN_SUCCESS
        ),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.setActiveAccount();
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) =>
            status === InteractionStatus.None
        ),
        takeUntil(this.destroying$)
      )
      .subscribe(() => {
        this.setActiveAccount();
      });
  }

  isLoggedIn(): boolean {
    return this.msalService.instance
      .getAllAccounts()
      .length > 0;
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance
      .getActiveAccount();
  }

  login(): void {
    this.msalService.loginRedirect();
  }

  logout(): void {
    this.msalService.logoutRedirect();
  }

  private setActiveAccount(): void {
    const accounts =
      this.msalService.instance.getAllAccounts();

    if (
      accounts.length > 0 &&
      !this.msalService.instance.getActiveAccount()
    ) {
      this.msalService.instance
        .setActiveAccount(accounts[0]);
    }
  }

  ngOnDestroy(): void {
    this.destroying$.next();
    this.destroying$.complete();
  }
}
