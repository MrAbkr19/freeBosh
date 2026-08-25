import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherModuleList } from './teacher-module-list';

describe('TeacherModuleList', () => {
  let component: TeacherModuleList;
  let fixture: ComponentFixture<TeacherModuleList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherModuleList],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherModuleList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
