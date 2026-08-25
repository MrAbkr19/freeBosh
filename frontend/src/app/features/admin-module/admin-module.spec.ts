import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminModule } from './admin-module';

describe('AdminModule', () => {
  let component: AdminModule;
  let fixture: ComponentFixture<AdminModule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminModule);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
