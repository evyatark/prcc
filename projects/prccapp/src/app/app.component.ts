import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { StateService } from './state.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Evyatar';

  // it seems that the constructor is called when navigating to any URL manually, but
  // not when navigating further in the Angular app through its links
  constructor(private route: ActivatedRoute, private router: Router, private state: StateService) { 
    console.log('AppComponent constructor STARTED');
    this.router.events.pipe(
      untilDestroyed(this),
      filter((event) => event instanceof NavigationEnd),
      map((event) => {
        const ne = event as NavigationEnd;
        const segments = ne.url.split('?')[0].split('/').filter(x => x.length > 0);
        const qs = ('?' + ne.url.split('?')[1]) || '';
        const sp = new URLSearchParams(qs);
        const params = Object.fromEntries(sp.entries());
        return {
          segments,
          params,
        };
      })
    ).subscribe(({segments, params}) => {
      this.state.initFromUrl(segments, params);
    });
  }
}
