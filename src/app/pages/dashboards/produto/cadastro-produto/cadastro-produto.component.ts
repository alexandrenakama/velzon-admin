// cadastro-produto.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Produto } from 'src/app/store/Produto/produto.model';
import { Ramo } from 'src/app/store/Ramo/ramo.model';
import { ProdutoService } from 'src/app/core/services/produto.service';
import { ToastService } from 'src/app/shared/toasts/toast-service';
import { dateRangeValidator } from './date-range.validator';

@Component({
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.component.html'
})
export class CadastroProdutoComponent implements OnInit, OnDestroy {
  @ViewChild('inicioDate') inicioDate!: ElementRef<HTMLInputElement>;
  @ViewChild('fimDate') fimDate!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  isEdit = false;
  private editingId?: number;

  ramos: Ramo[] = [];
  filteredRamos: Ramo[] = [];
  showRamoList = false;
  searchTerm = '';
  private ramoSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.produtoService.getRamos().subscribe(list => {
      this.ramos = list;

      this.ramoSub = this.form.get('ramo')!.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(v => typeof v === 'string' ? v : ''),
        map(term => {
          this.searchTerm = term;
          const t = term.trim().toLowerCase();
          return this.ramos.filter(r =>
            r.identificadorRamo.toLowerCase().includes(t) ||
            r.nomeRamo.toLowerCase().includes(t)
          );
        })
      ).subscribe(list => this.filteredRamos = list);

      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit = true;
          this.editingId = +idParam;
          const prod = this.produtoService.getById(this.editingId!);
          if (prod) {
            const ramoObj = this.ramos.find(r => r.identificadorRamo === prod.ramoId.toString())!;
            this.form.patchValue({
              ramo: `${ramoObj.identificadorRamo} – ${ramoObj.nomeRamo}`,
              ramoId: ramoObj.identificadorRamo,
              id: prod.id,
              nomeProduto: prod.nomeProduto,
              nomeAbreviadoProduto: prod.nomeAbreviadoProduto,
              numeroProcessoSusep: prod.numeroProcessoSusep,
              inicioVigencia: prod.inicioVigencia,
              fimVigencia: prod.fimVigencia,
              permitePessoaFisica: prod.permitePessoaFisica,
              permitePessoaJuridica: prod.permitePessoaJuridica,
              produtoAtivo: prod.ativo
            });
            this.form.get('id')?.disable();
          }
        }
      });
    });

    // revalida unicidades e datas
    this.form.get('id')!.valueChanges.subscribe(() =>
      this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
    this.form.get('numeroProcessoSusep')!.valueChanges.subscribe(() =>
      this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false })
    );
    this.form.get('inicioVigencia')!.valueChanges.subscribe(() =>
      this.form.updateValueAndValidity()
    );
    this.form.get('fimVigencia')!.valueChanges.subscribe(() =>
      this.form.updateValueAndValidity()
    );
  }

  ngOnDestroy(): void {
    this.ramoSub?.unsubscribe();
  }

  private buildForm() {
    this.form = this.fb.group({
      ramo: ['', Validators.required],
      ramoId: [null, Validators.required],
      id: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nomeProduto: ['', Validators.required],
      nomeAbreviadoProduto: [''],
      numeroProcessoSusep: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      inicioVigencia: [null, Validators.required],
      fimVigencia: [null, Validators.required],
      permitePessoaFisica: [true],
      permitePessoaJuridica: [true],
      produtoAtivo: [true]
    }, {
      validators: [
        dateRangeValidator,
        this.uniqueIdValidator.bind(this),
        this.uniqueSusepValidator.bind(this),
        this.idDiffersFromSusepValidator.bind(this)
      ]
    });
  }

  onRamoInput(term: string): void {
    this.searchTerm = term;
    this.showRamoList = true;
  }

  openRamoList(): void {
    this.showRamoList = true;
    if (!this.filteredRamos.length) {
      this.filteredRamos = [...this.ramos];
    }
  }

  closeRamoList(): void {
    setTimeout(() => this.showRamoList = false, 200);
  }

  selectRamo(r: Ramo): void {
    this.form.patchValue({
      ramo: `${r.identificadorRamo} – ${r.nomeRamo}`,
      ramoId: r.identificadorRamo
    });
    this.form.markAsDirty();
    this.showRamoList = false;
  }

  onBlurRamo(): void {
    const ctrl = this.form.get('ramo')!;
    const val = ctrl.value as string;
    const match = this.ramos.find(r =>
      `${r.identificadorRamo} – ${r.nomeRamo}` === val
    );
    if (!match) {
      this.form.patchValue({ ramoId: null }, { emitEvent: false });
      ctrl.setErrors(val ? { invalidRamo: true } : { required: true });
    }
  }

  private uniqueIdValidator(ctrl: AbstractControl): ValidationErrors | null {
    const idVal = ctrl.get('id')?.value;
    if (!idVal) return null;
    const existing = this.produtoService.getById(+idVal);
    if (existing && (!this.isEdit || this.editingId !== +idVal)) {
      return { uniqueId: 'Já existe um produto com este ID.' };
    }
    return null;
  }

  private uniqueSusepValidator(ctrl: AbstractControl): ValidationErrors | null {
    const numVal = ctrl.get('numeroProcessoSusep')?.value;
    if (!numVal) return null;
    const existing = this.produtoService.getBySusep(+numVal);
    if (existing && (!this.isEdit || this.editingId !== existing.id)) {
      return { uniqueSusep: 'Já existe um produto com este Nº Proc. SUSEP.' };
    }
    return null;
  }

  private idDiffersFromSusepValidator(ctrl: AbstractControl): ValidationErrors | null {
    const idVal = ctrl.get('id')?.value;
    const numVal = ctrl.get('numeroProcessoSusep')?.value;
    if (idVal != null && numVal != null && +idVal === +numVal) {
      return { idEqualsSusep: 'ID do produto não pode ser igual ao Nº Proc. SUSEP.' };
    }
    return null;
  }

  openInicioPicker(): void { this.inicioDate.nativeElement.showPicker(); }
  openFimPicker(): void { this.fimDate.nativeElement.showPicker(); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const selected = this.ramos.find(r => r.identificadorRamo === v.ramoId)!;
    const prod: Produto = {
      id: +v.id,
      ramoId: +v.ramoId!,
      nomeRamo: selected.nomeRamo,
      nomeProduto: v.nomeProduto,
      nomeAbreviadoProduto: v.nomeAbreviadoProduto,
      numeroProcessoSusep: +v.numeroProcessoSusep,
      inicioVigencia: v.inicioVigencia,
      fimVigencia: v.fimVigencia,
      permitePessoaFisica: v.permitePessoaFisica,
      permitePessoaJuridica: v.permitePessoaJuridica,
      ativo: v.produtoAtivo
    };
    const op$ = this.isEdit
      ? this.produtoService.update(prod)
      : this.produtoService.create(prod);
    op$.subscribe({
      next: () => {
        const msg = this.isEdit
          ? `Produto "${prod.nomeProduto}" atualizado!`
          : `Produto "${prod.nomeProduto}" criado!`;
        this.toastService.show(msg, {
          classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
          delay: 5000
        });
        if (!this.isEdit) this.router.navigate(['/produto']);
      },
      error: () => {
        this.toastService.show('Erro ao salvar produto.', {
          classname: 'bg-warning text-dark',
          delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/produto']);
  }
}
