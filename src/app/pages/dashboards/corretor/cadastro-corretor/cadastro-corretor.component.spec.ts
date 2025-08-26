import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCorretorComponent } from './cadastro-corretor.component';

describe('CadastroCorretorComponent', () => {
  let component: CadastroCorretorComponent;
  let fixture: ComponentFixture<CadastroCorretorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroCorretorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroCorretorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
