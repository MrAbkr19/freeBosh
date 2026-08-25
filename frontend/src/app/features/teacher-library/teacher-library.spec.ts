import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherLibrary } from './teacher-library';

describe('TeacherLibrary', () => {
  let component: TeacherLibrary;
  let fixture: ComponentFixture<TeacherLibrary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherLibrary],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherLibrary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
