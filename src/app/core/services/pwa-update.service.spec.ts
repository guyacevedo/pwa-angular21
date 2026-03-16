import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { PwaUpdateService } from './pwa-update.service';

describe('PwaUpdateService', () => {
  let service: PwaUpdateService;
  let versionUpdates$: Subject<{ type: string }>;

  beforeEach(() => {
    versionUpdates$ = new Subject();

    TestBed.configureTestingModule({
      providers: [
        PwaUpdateService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: SwUpdate,
          useValue: {
            isEnabled: true,
            versionUpdates: versionUpdates$.asObservable(),
            checkForUpdate: vi.fn().mockResolvedValue(true),
          },
        },
      ],
    });

    service = TestBed.inject(PwaUpdateService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should not throw when init is called', () => {
    expect(() => service.init()).not.toThrow();
  });

  it('should handle VERSION_READY events', () => {
    // Mock confirm to auto-decline
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    service.init();

    versionUpdates$.next({ type: 'VERSION_READY' });

    expect(globalThis.confirm).toHaveBeenCalledWith(
      'Hay una nueva versión disponible. ¿Deseas actualizar ahora?',
    );
  });
});
