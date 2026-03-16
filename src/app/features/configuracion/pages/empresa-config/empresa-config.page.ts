import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { InputCustomComponent } from '../../../../shared/components/input-custom/input-custom.component';
import { FormHeaderComponent } from '../../../../shared/components/form-header/form-header.component';
import { FormCardComponent } from '../../../../shared/components/form-card/form-card.component';
import { AppSuccessModalComponent } from '../../../../shared/components/success-modal/success-modal.component';
import { AppErrorModalComponent } from '../../../../shared/components/error-modal/error-modal.component';
import { Empresa } from 'src/app/core/models/empresa.model';
import { ConfiguracionService } from 'src/app/core/services/configuracion.service';

@Component({
  selector: 'app-empresa-config',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputCustomComponent,
    FormHeaderComponent,
    FormCardComponent,
    NgOptimizedImage,
    AppSuccessModalComponent,
    AppErrorModalComponent,
  ],
  templateUrl: './empresa-config.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmpresaConfigPage {
  private fb = inject(FormBuilder);
  private configService = inject(ConfiguracionService);

  form: FormGroup;
  loading = signal(true);
  saving = signal(false);
  showSuccess = signal(false);
  showError = signal(false);
  errorMessage = signal('Error al guardar la configuración. Intenta nuevamente.');

  constructor() {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      nit: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      ciudad: ['Magangué'],
      departamento: ['Bolívar'],
      pais: ['Colombia'],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      sitioWeb: [''],
      regimenTributario: ['Régimen Simplificado'],
      matriculaComercio: ['44760'],
      camaraComercio: ['Magangué'],
      representanteLegal: [''],
      cedulaRepresentante: [''],
      actividadEconomica: [
        'Comercio al por menor de carnes (incluye aves de corral), productos cárnicos, pescados y productos de mar, en establecimientos especializados',
      ],
      pieDePaginaFactura: [
        'Gracias por su compra.\nEsta factura se asimila en todos sus efectos a una letra de cambio (Art. 774 del Código de Comercio).',
      ],
    });

    this.loadConfig();
  }

  private async loadConfig() {
    try {
      const config = await this.configService.getConfig();
      if (config) this.form.patchValue(config);
    } catch {
      this.errorMessage.set('Error al cargar la configuración.');
      this.showError.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const data: Empresa = this.form.value;
      await this.configService.saveConfig(data);
      this.showSuccess.set(true);
    } catch {
      this.errorMessage.set('Error al guardar la configuración. Intenta nuevamente.');
      this.showError.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  async retrySave() {
    this.showError.set(false);
    await this.save();
  }
}
