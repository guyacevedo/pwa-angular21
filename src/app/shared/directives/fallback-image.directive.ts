import { Directive, HostListener, inject, ElementRef, input } from '@angular/core';

@Directive({
    selector: 'img[appFallbackImage]',
    standalone: true,
})
export class FallbackImageDirective {
    private el = inject(ElementRef);

    readonly fallbackUrl = input<string>('/product-default.png', { alias: 'appFallbackImage' });

    @HostListener('error')
    onError() {
        const element = this.el.nativeElement as HTMLImageElement;
        if (element.src !== this.fallbackUrl()) {
            element.src = this.fallbackUrl();
        }
    }
}
