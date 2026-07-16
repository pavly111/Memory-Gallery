import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoLightbox } from './photo-lightbox';

describe('PhotoLightbox', () => {
  let component: PhotoLightbox;
  let fixture: ComponentFixture<PhotoLightbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoLightbox],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoLightbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
