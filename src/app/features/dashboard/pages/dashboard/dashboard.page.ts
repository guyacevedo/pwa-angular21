import {
  Component,
  inject,
  computed,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EstadisticasService } from '../../../../core/services/estadisticas.service';
import { AuthFacade } from '../../../auth/auth.facade';
import { PermissionsService } from '../../../../core/services/permissions.service';
import { SvgIconComponent } from '../../../../shared/icons/svg-icon.component';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { AlertCardComponent } from '../../../../shared/components/alert-card/alert-card.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { USER_ROLES_LABELS } from '../../../../core/types/user-role.type';
import { USER_STATUS_LABELS } from '../../../../core/types/user-status.type';
import { CloudinaryService } from '../../../../core/services/cloudinary.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    RouterLink,
    KpiCardComponent,
    AlertCardComponent,
    StatusBadgeComponent,
    SvgIconComponent,
  ],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  readonly stats = inject(EstadisticasService);
  readonly permissions = inject(PermissionsService);
  private readonly authFacade = inject(AuthFacade);
  private readonly cloudinaryService = inject(CloudinaryService);

  readonly fechaHoy = new Date();
  readonly isLoading = signal(true);

  readonly kpiCards = computed(() => this.stats.widgets());
  readonly alertas = computed(() => this.stats.alertas());

  readonly user = this.authFacade.user;

  readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName ?? ''}`.trim() : 'Usuario';
  });

  readonly roleLabel = computed(() => USER_ROLES_LABELS[this.user()?.role ?? 'CHOFER']);
  readonly statusLabel = computed(() => USER_STATUS_LABELS[this.user()?.status ?? 'INACTIVE']);
  readonly statusBadgeType = computed(() => {
    switch (this.user()?.status) {
      case 'ACTIVE': return 'success' as const;
      case 'INACTIVE': return 'warning' as const;
      case 'DISABLED': return 'danger' as const;
      default: return 'neutral' as const;
    }
  });

  readonly profilePictureUrl = computed(() => {
    const u = this.user();
    if (u?.profilePictureUrl) {
      return this.cloudinaryService.getTransformedUrl(u.profilePictureUrl, 'w_80,h_80,c_fill,g_face,f_webp');
    }
    return this.cloudinaryService.defaultProfilePictureUrl;
  });

  async ngOnInit(): Promise<void> {
    await this.stats.refresh();
    this.isLoading.set(false);
  }
}
