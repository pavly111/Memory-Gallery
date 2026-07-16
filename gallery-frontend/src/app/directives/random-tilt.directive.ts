// directives/random-tilt.directive.ts
// Applies a small random rotation to whatever element it's placed on —
// used on each polaroid in EventGalleryComponent for the hand-clipped,
// imperfect feel described in the design doc. This is the exact directive
// from today's Angular task, now actually wired into the real app instead
// of sitting as a standalone example.

import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appRandomTilt]',
  standalone: true,
})
export class RandomTiltDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const degrees = Math.random() * 6 - 3; // between -3deg and +3deg
    this.el.nativeElement.style.transform = `rotate(${degrees}deg)`;
  }
}