import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishDocument } from './publish-document';

describe('PublishDocument', () => {
  let component: PublishDocument;
  let fixture: ComponentFixture<PublishDocument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishDocument],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishDocument);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
