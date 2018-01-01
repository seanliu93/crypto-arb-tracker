import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradingPairCardComponent } from './trading-pair-card.component';

describe('TradingPairCardComponent', () => {
  let component: TradingPairCardComponent;
  let fixture: ComponentFixture<TradingPairCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradingPairCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradingPairCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
