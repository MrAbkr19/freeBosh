import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherModuleDetail } from './teacher-module-detail';

describe('TeacherModuleDetail', () => {
  let component: TeacherModuleDetail;
  let fixture: ComponentFixture<TeacherModuleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherModuleDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherModuleDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
