// src/app/pages/dashboards/produto/cadastro-produto/cadastro-produto.component.ts
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

import { Produto } from 'src/app/store/Produto/produto.model';
import { Ramo }   from 'src/app/store/Ramo/ramo.model';
import { ProdutoService } from 'src/app/core/services/produto.service';
import { ToastService }   from 'src/app/shared/toasts/toast-service';
import { dateRangeValidator } from './date-range.validator';

@Component({
  selector: 'app-cadastro-produto',
  templateUrl: './cadastro-produto.component.html',
  styleUrls: ['./cadastro-produto.component.scss']
})
export class CadastroProdutoComponent implements OnInit {
  @ViewChild('inicioDate') inicioDate!: ElementRef<HTMLInputElement>;
  @ViewChild('fimDate')    fimDate!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  isEdit = false;
  private editingId?: number;
  ramos: Ramo[] = [];

  constructor(
    private fb: FormBuilder,
    private produtoService: ProdutoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // 1) carrega lista de ramos
    this.produtoService.getRamos().subscribe(list => {
      this.ramos = list;

      // 2) checa se é edição
      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit = true;
          this.editingId = +idParam;
          const prod = this.produtoService.getById(this.editingId!);
          if (prod) {
            const ramoObj = this.ramos.find(r => r.identificadorRamo === prod.ramoId.toString())!;
            this.form.patchValue({
              ramo:                  ramoObj,
              ramoId:                ramoObj.identificadorRamo,
              id:                    prod.id,
              nomeProduto:           prod.nomeProduto,
              nomeAbreviadoProduto:  prod.nomeAbreviadoProduto,
              numeroProcessoSusep:   prod.numeroProcessoSusep,
              inicioVigencia:        prod.inicioVigencia,
              fimVigencia:           prod.fimVigencia,
              permitePessoaFisica:   prod.permitePessoaFisica,
              permitePessoaJuridica: prod.permitePessoaJuridica,
              produtoAtivo:          prod.ativo
            });
            this.form.get('id')?.disable();
          }
        }
      });
    });

    // revalida unicidade quando ID ou SUSEP mudam
    this.form.get('id')!.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
    this.form.get('numeroProcessoSusep')!.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  private buildForm() {
    this.form = this.fb.group({
      ramo:                   [null as Ramo | null, Validators.required],
      ramoId:                 [null, Validators.required],
      id:                     [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nomeProduto:            ['', Validators.required],
      nomeAbreviadoProduto:   [''],
      numeroProcessoSusep:    [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      inicioVigencia:         [null, Validators.required],
      fimVigencia:            [null, Validators.required],
      permitePessoaFisica:    [true],
      permitePessoaJuridica:  [true],
      produtoAtivo:           [true]
    }, {
      validators: [
        dateRangeValidator,
        this.uniqueIdValidator.bind(this),
        this.uniqueSusepValidator.bind(this),
        this.idDiffersFromSusepValidator.bind(this)
      ]
    });
  }

  /** Verifica se já existe um produto com este ID */
  private uniqueIdValidator(ctrl: AbstractControl): ValidationErrors | null {
    const idVal = ctrl.get('id')?.value;
    if (!idVal) return null;
    const existing = this.produtoService.getById(+idVal);
    if (existing && (!this.isEdit || this.editingId !== +idVal)) {
      return { uniqueId: 'Já existe um produto com este ID.' };
    }
    return null;
  }

  /** Verifica se já existe um produto com este Nº Processo SUSEP */
  private uniqueSusepValidator(ctrl: AbstractControl): ValidationErrors | null {
    const numVal = ctrl.get('numeroProcessoSusep')?.value;
    if (!numVal) return null;
    const existing = this.produtoService.getBySusep(+numVal);
    if (existing && (!this.isEdit || this.editingId !== existing.id)) {
      return { uniqueSusep: 'Já existe um produto com este Nº Proc. SUSEP.' };
    }
    return null;
  }

  /** ID e Processo SUSEP não podem ser iguais */
  private idDiffersFromSusepValidator(ctrl: AbstractControl): ValidationErrors | null {
    const idVal  = ctrl.get('id')?.value;
    const numVal = ctrl.get('numeroProcessoSusep')?.value;
    if (idVal != null && numVal != null && +idVal === +numVal) {
      return { idEqualsSusep: 'ID do produto não pode ser igual ao Nº Proc. SUSEP.' };
    }
    return null;
  }

  // typeahead...
  searchRamo: OperatorFunction<string, Ramo[]> = text$ =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        const t = term.trim().toLowerCase();
        return this.ramos
          .filter(r =>
            r.identificadorRamo.toLowerCase().includes(t) ||
            r.nomeRamo.toLowerCase().includes(t)
          )
          .slice(0, 20);
      })
    );

  formatter = (r: Ramo) => r ? `${r.identificadorRamo} – ${r.nomeRamo}` : '';
  onSelectRamo(event: NgbTypeaheadSelectItemEvent<Ramo>) {
    const ramo = event.item;
    this.form.patchValue({ ramo, ramoId: ramo.identificadorRamo });
  }
  openDropdown(e: Event) {
    e.stopPropagation();
    this.form.patchValue({ ramo: null, ramoId: null });
    setTimeout(() => (e.target as HTMLElement).dispatchEvent(new Event('input')), 0);
  }
  openInicioPicker() { this.inicioDate.nativeElement.showPicker(); }
  openFimPicker()    { this.fimDate.nativeElement.showPicker(); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const prod: Produto = {
      id:                    +v.id,
      ramoId:                +v.ramoId,
      nomeRamo:              v.ramo.nomeRamo,
      nomeProduto:           v.nomeProduto,
      nomeAbreviadoProduto:  v.nomeAbreviadoProduto,
      numeroProcessoSusep:   +v.numeroProcessoSusep,
      inicioVigencia:        v.inicioVigencia,
      fimVigencia:           v.fimVigencia,
      permitePessoaFisica:   v.permitePessoaFisica,
      permitePessoaJuridica: v.permitePessoaJuridica,
      ativo:                 v.produtoAtivo
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
        this.toastService.show(
          'Erro ao salvar produto.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        );
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/produto']);
  }
}
