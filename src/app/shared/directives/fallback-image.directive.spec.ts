import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FallbackImageDirective } from './fallback-image.directive';

@Component({
  standalone: true,
  imports: [FallbackImageDirective],
  template: `<img appFallbackImage="https://fallback.com/img.png" src="https://invalid.com/404.png" alt="Test image" />`,
})
class TestHostComponent {}

describe('FallbackImageDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create the host component with the directive', () => {
    const imgEl = fixture.nativeElement.querySelector('img');
    expect(imgEl).toBeTruthy();
  });

  it('should replace src with fallback URL on error', () => {
    const imgEl: HTMLImageElement = fixture.nativeElement.querySelector('img');

    // Simulate image load error
    imgEl.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(imgEl.src).toBe('https://fallback.com/img.png');
  });
});
