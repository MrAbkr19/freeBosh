import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeAnnouncement } from './make-announcement';

describe('MakeAnnouncement', () => {
  let component: MakeAnnouncement;
  let fixture: ComponentFixture<MakeAnnouncement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeAnnouncement],
    }).compileComponents();

    fixture = TestBed.createComponent(MakeAnnouncement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
