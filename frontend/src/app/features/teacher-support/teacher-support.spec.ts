import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSupport } from './teacher-support';

describe('TeacherSupport', () => {
  let component: TeacherSupport;
  let fixture: ComponentFixture<TeacherSupport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherSupport],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherSupport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
