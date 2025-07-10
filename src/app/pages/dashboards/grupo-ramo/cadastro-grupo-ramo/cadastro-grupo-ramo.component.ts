// src/app/pages/dashboards/grupo-ramo/cadastro-grupo-ramo/cadastro-grupo-ramo.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GrupoRamo }          from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { Seguradora }         from 'src/app/store/Seguradora/seguradora.model';
import { GrupoRamoService }   from 'src/app/core/services/grupo-ramo.service';
import { SeguradoraService }  from 'src/app/core/services/seguradora.service';
import { ToastService }       from 'src/app/shared/toasts/toast-service';

@Component({
  selector: 'app-cadastro-grupo-ramo',
  templateUrl: './cadastro-grupo-ramo.component.html',
  styleUrls: ['./cadastro-grupo-ramo.component.scss']
})
export class CadastroGrupoRamoComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;

  seguradoras: Seguradora[] = [];

  constructor(
    private fb:              FormBuilder,
    private service:         GrupoRamoService,
    private segService:      SeguradoraService,
    private router:          Router,
    private route:           ActivatedRoute,
    private toast:           ToastService
  ) {}

  ngOnInit(): void {
    // carrega as seguradoras para o select
    this.segService.getAll().subscribe(list => this.seguradoras = list);

    this.buildForm();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEdit = true;
        this.editingId = +idParam;
        const grp = this.service.getById(this.editingId);
        if (grp) {
          this.form.patchValue({
            id:           grp.id,
            nome:         grp.nome,
            seguradoraId: grp.seguradoraId
          });
        }
      }
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:           [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:         ['', Validators.required],
      seguradoraId: [null, Validators.required]
    }, {
      validators: [ this.uniqueIdValidator.bind(this) ]
    });
  }

  private uniqueIdValidator(control: AbstractControl): ValidationErrors | null {
    const idCtrl = control.get('id');
    const id = idCtrl?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe um grupo com este ID.' };
    }
    return null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const grupo: GrupoRamo = {
      id:           +v.id,
      nome:         v.nome,
      seguradoraId: +v.seguradoraId
    };

    const op$ = this.isEdit
      ? this.service.update(grupo)
      : this.service.create(grupo);

    op$.subscribe({
      next: () => {
        const msg = this.isEdit
          ? `Grupo de Ramo "${grupo.nome}" atualizado!`
          : `Grupo de Ramo "${grupo.nome}" criado!`;
        this.toast.show(msg, {
          classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
          delay: 5000
        });
        if (!this.isEdit) {
          this.router.navigate(['/grupo-ramo']);
        }
      },
      error: () => {
        this.toast.show('Erro ao salvar grupo de ramo.', {
          classname: 'bg-warning text-dark',
          delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/grupo-ramo']);
  }
}
