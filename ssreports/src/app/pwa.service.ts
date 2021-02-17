import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { PromptComponentComponent } from './prompt-component/prompt-component.component';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  
  private promptEvent: any;
  
  constructor(
    private bottomSheet: MatBottomSheet,
    private platform: Platform,
    private readonly swUpdate: SwUpdate) { }

    public initPwaPrompt() {
      this.swUpdate.available.subscribe(event => {
        if (confirm("A new update of this app is available and is ready to install,\ would you like to install it now?")) {
          window.location.reload();
        }
      })
      if (this.platform.ANDROID) {
        window.addEventListener('beforeinstallprompt', (event: any) => {
          event.preventDefault();
          this.promptEvent = event;
          this.openPromptComponent('android');
        });
      }
      if (this.platform.IOS) {
        const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator['standalone']);
        if (!isInStandaloneMode) {
          this.openPromptComponent('ios');
        }
      }
    }
  
    private openPromptComponent(mobileType: 'ios' | 'android') {
      timer(3000)
        .pipe(take(1))
        .subscribe(() => this.bottomSheet.open(PromptComponentComponent, { data: { mobileType, promptEvent: this.promptEvent } }));
  }
}
