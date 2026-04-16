import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { PromoFooterComponent } from './promo-footer.component';

describe('PromoFooterComponent', () => {
  let component: PromoFooterComponent;
  let fixture: ComponentFixture<PromoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromoFooterComponent],
      imports: [CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoFooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should select a promo on init', () => {
    fixture.detectChanges();
    expect(component.selectedPromo).toBeTruthy();
    expect(['instanceiro', 'claudinhos']).toContain(component.selectedPromo.id);
  });

  it('should render the promo title', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.promo-title');
    expect(title?.textContent).toContain(component.selectedPromo.title);
  });

  it('should render a CTA button only for clickable promos', () => {
    fixture.detectChanges();

    // Force Instanceiro (clickable)
    component.selectedPromo = { id: 'instanceiro', title: 'Instanceiro', description: 'Test', logoSrc: '', ctaLabel: 'Acessar →', ctaUrl: 'https://instanceiro.vercel.app', label: 'outros projetos da casa', bgGradient: '', titleColor: '', isClickable: true };
    fixture.detectChanges();
    const cta = fixture.nativeElement.querySelector('.promo-cta');
    expect(cta).toBeTruthy();
    expect(cta.textContent).toContain('Acessar');

    // Force Claudinhos (not clickable)
    component.selectedPromo = { id: 'claudinhos', title: 'Guilda Claudinhos', description: 'Test', logoSrc: '', bgGradient: '', titleColor: '', isClickable: false };
    fixture.detectChanges();
    const ctaAfter = fixture.nativeElement.querySelector('.promo-cta');
    expect(ctaAfter).toBeNull();
  });

  it('should wrap clickable promo in an anchor tag with UTM', () => {
    fixture.detectChanges();
    component.selectedPromo = { id: 'instanceiro', title: 'Instanceiro', description: 'Test', logoSrc: '', ctaLabel: 'Acessar →', ctaUrl: 'https://instanceiro.vercel.app?utm_source=rocalc&utm_medium=promo-footer', label: 'outros projetos da casa', bgGradient: '', titleColor: '', isClickable: true };
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.promo-clickable');
    expect(link).toBeTruthy();
    expect(link.href).toContain('utm_source=rocalc');
    expect(link.target).toBe('_blank');
  });

  it('should render selo (non-clickable) as div, not anchor', () => {
    fixture.detectChanges();
    component.selectedPromo = { id: 'claudinhos', title: 'Guilda Claudinhos', description: 'Test', logoSrc: '', bgGradient: '', titleColor: '', isClickable: false };
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.promo-clickable');
    const div = fixture.nativeElement.querySelector('.promo-row:not(a)');
    expect(link).toBeNull();
    expect(div).toBeTruthy();
  });

  it('should display the label tag only for promos with label', () => {
    fixture.detectChanges();
    component.selectedPromo = { id: 'instanceiro', title: 'Instanceiro', description: 'Test', logoSrc: '', label: 'outros projetos da casa', bgGradient: '', titleColor: '', isClickable: true };
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.promo-label');
    expect(label?.textContent?.trim()).toBe('outros projetos da casa');

    component.selectedPromo = { id: 'claudinhos', title: 'Guilda Claudinhos', description: 'Test', logoSrc: '', bgGradient: '', titleColor: '', isClickable: false };
    fixture.detectChanges();
    const labelAfter = fixture.nativeElement.querySelector('.promo-label');
    expect(labelAfter).toBeNull();
  });

  it('should not display a copyright baseline (banner is at top, not footer)', () => {
    fixture.detectChanges();
    const baseline = fixture.nativeElement.querySelector('.promo-baseline');
    expect(baseline).toBeNull();
  });

  it('should have 10 instanceiro descriptions', () => {
    expect((component as any).instanceiroDescriptions.length).toBe(10);
  });

  it('should set a non-empty description for instanceiro', () => {
    // Run multiple times to ensure instanceiro gets picked at least once
    for (let i = 0; i < 20; i++) {
      component.ngOnInit();
      if (component.selectedPromo.id === 'instanceiro') {
        expect(component.selectedPromo.description.length).toBeGreaterThan(0);
        return;
      }
    }
    // If we never got instanceiro in 20 tries, force it to validate
    (component as any).selectedPromo = { ...(component as any).instanceiroBase, description: (component as any).instanceiroDescriptions[0] };
    expect(component.selectedPromo.description.length).toBeGreaterThan(0);
  });
});
