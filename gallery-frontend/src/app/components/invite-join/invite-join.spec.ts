import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteJoin } from './invite-join';

describe('InviteJoin', () => {
  let component: InviteJoin;
  let fixture: ComponentFixture<InviteJoin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteJoin],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteJoin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
