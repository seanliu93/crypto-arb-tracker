import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArbTableComponent } from './arb-table.component';

describe('ArbTableComponent', () => {
  let component: ArbTableComponent;
  let fixture: ComponentFixture<ArbTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArbTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArbTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
