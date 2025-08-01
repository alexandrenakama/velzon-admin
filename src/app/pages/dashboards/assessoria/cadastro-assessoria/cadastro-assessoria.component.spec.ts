import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroAssessoriaComponent } from './cadastro-assessoria.component';

describe('CadastroAssessoriaComponent', () => {
  let component: CadastroAssessoriaComponent;
  let fixture: ComponentFixture<CadastroAssessoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroAssessoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroAssessoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
