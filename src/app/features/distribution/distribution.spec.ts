import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Distribution } from './distribution';

describe('Distribution', () => {
  let component: Distribution;
  let fixture: ComponentFixture<Distribution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Distribution],
    }).compileComponents();

    fixture = TestBed.createComponent(Distribution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
