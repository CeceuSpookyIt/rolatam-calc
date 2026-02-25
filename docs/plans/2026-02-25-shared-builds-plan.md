# Shared Builds Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the complex preset-sharing workflow with a direct "Compartilhar" button on the calculator, backed by a new `shared_builds` table in Supabase.

**Architecture:** New `SharedBuildService` talks to Supabase `shared_builds` and `shared_build_likes` tables. Calculator component gets a share button that opens a dialog. Shared-preset page is rewritten to read from `shared_builds`. Link sharing via `/shared-presets/:id` loads the build directly into the calculator.

**Tech Stack:** Angular 16, Supabase (PostgreSQL + RLS + JS client), PrimeNG, Jasmine/Karma

**Design doc:** `docs/plans/2026-02-25-shared-builds-design.md`

---

### Task 1: Create Supabase tables and RLS policies

**Context:** The Supabase project is at `https://qiljbwitdknpxbbpmcjn.supabase.co`. Tables need to be created via the Supabase dashboard SQL editor.

**Step 1: Create the SQL migration file**

Create `docs/plans/shared-builds-migration.sql` with the full SQL:

```sql
-- shared_builds table
CREATE TABLE shared_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id INTEGER NOT NULL,
  model JSONB NOT NULL,
  monster_id INTEGER,
  monster_name TEXT,
  skill_name TEXT,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_shared_builds_class_id ON shared_builds(class_id);
CREATE INDEX idx_shared_builds_created_at ON shared_builds(created_at DESC);
CREATE INDEX idx_shared_builds_user_id ON shared_builds(user_id);

-- RLS
ALTER TABLE shared_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared builds"
  ON shared_builds FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert"
  ON shared_builds FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authors can update own builds"
  ON shared_builds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own builds"
  ON shared_builds FOR DELETE
  USING (auth.uid() = user_id);

-- shared_build_likes table
CREATE TABLE shared_build_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES shared_builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(build_id, user_id)
);

CREATE INDEX idx_shared_build_likes_build_id ON shared_build_likes(build_id);

-- RLS
ALTER TABLE shared_build_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON shared_build_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON shared_build_likes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
  ON shared_build_likes FOR DELETE
  USING (auth.uid() = user_id);
```

**Step 2: Run the SQL in Supabase dashboard**

Navigate to Supabase SQL Editor and execute the migration.

**Step 3: Commit**

```bash
git add docs/plans/shared-builds-migration.sql
git commit -m "Add SQL migration for shared_builds and shared_build_likes tables"
```

---

### Task 2: Create SharedBuild models

**Files:**
- Create: `src/app/api-services/models/shared-build.model.ts`
- Modify: `src/app/api-services/models/index.ts`

**Step 1: Create the model file**

```typescript
// src/app/api-services/models/shared-build.model.ts
import { PresetModel } from './preset-model';

export interface SharedBuildMetrics {
  dps: number;
  maxDamage: number;
  minDamage: number;
  aspd: number;
  hitPerSecs: number;
  totalHit: number;
  criRate: number;
  criDmg: number;
  vct: number;
  fct: number;
  acd: number;
  hp: number;
  sp: number;
}

export interface SharedBuild {
  id: string;
  name: string;
  classId: number;
  model: PresetModel;
  monsterId: number | null;
  monsterName: string | null;
  skillName: string | null;
  metrics: SharedBuildMetrics | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  likeCount?: number;
  liked?: boolean;
}

export interface SharedBuildListResponse {
  items: SharedBuild[];
  totalItem: number;
  skip: number;
  take: number;
}

export interface CreateSharedBuildRequest {
  name: string;
  model: PresetModel;
  monsterId?: number;
  monsterName?: string;
  skillName?: string;
  metrics?: SharedBuildMetrics;
}

export interface UpdateSharedBuildRequest {
  name?: string;
  model?: PresetModel;
  monsterId?: number;
  monsterName?: string;
  skillName?: string;
  metrics?: SharedBuildMetrics;
}
```

**Step 2: Add export to barrel**

In `src/app/api-services/models/index.ts`, add:

```typescript
export * from './shared-build.model';
```

**Step 3: Commit**

```bash
git add src/app/api-services/models/shared-build.model.ts src/app/api-services/models/index.ts
git commit -m "Add SharedBuild models and types"
```

---

### Task 3: Create SharedBuildService with tests

**Files:**
- Create: `src/app/api-services/shared-build.service.ts`
- Create: `src/app/api-services/shared-build.service.spec.ts`
- Modify: `src/app/api-services/api-service.module.ts`
- Modify: `src/app/api-services/index.ts`

**Step 1: Write the test file**

```typescript
// src/app/api-services/shared-build.service.spec.ts
import { SharedBuildService } from './shared-build.service';

describe('SharedBuildService', () => {
  let service: SharedBuildService;
  let mockSupabaseService: any;
  let mockAuthService: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    mockQueryBuilder = {
      select: jasmine.createSpy('select').and.returnValue(mockQueryBuilder),
      insert: jasmine.createSpy('insert').and.returnValue(mockQueryBuilder),
      update: jasmine.createSpy('update').and.returnValue(mockQueryBuilder),
      delete: jasmine.createSpy('delete').and.returnValue(mockQueryBuilder),
      eq: jasmine.createSpy('eq').and.returnValue(mockQueryBuilder),
      order: jasmine.createSpy('order').and.returnValue(mockQueryBuilder),
      range: jasmine.createSpy('range').and.returnValue(mockQueryBuilder),
      single: jasmine.createSpy('single').and.returnValue(
        Promise.resolve({ data: { id: 'test-id', name: 'Test', class_id: 1, model: {}, user_id: 'user-1', created_at: '', updated_at: '' }, error: null })
      ),
    };
    // Make chained calls return promises for terminal calls
    mockQueryBuilder.select.and.returnValue(mockQueryBuilder);
    mockQueryBuilder.eq.and.returnValue(mockQueryBuilder);
    mockQueryBuilder.order.and.returnValue(mockQueryBuilder);
    mockQueryBuilder.range.and.returnValue(
      Promise.resolve({ data: [], error: null, count: 0 })
    );

    mockSupabaseService = {
      client: {
        from: jasmine.createSpy('from').and.returnValue(mockQueryBuilder),
      },
    };

    mockAuthService = {
      getCurrentUserId: jasmine.createSpy('getCurrentUserId').and.returnValue(Promise.resolve('user-1')),
      isLoggedIn: true,
    };

    service = new SharedBuildService(mockSupabaseService, mockAuthService);
  });

  describe('mapBuildFromDb', () => {
    it('should map database row to SharedBuild model', () => {
      const row = {
        id: 'abc', name: 'Test Build', class_id: 4, model: { class: 4 },
        monster_id: 1002, monster_name: 'Poring', skill_name: 'Bash',
        metrics: { dps: 1000 }, created_at: '2026-01-01', updated_at: '2026-01-01',
        user_id: 'user-1',
      };
      const result = (service as any).mapBuildFromDb(row);
      expect(result.id).toBe('abc');
      expect(result.name).toBe('Test Build');
      expect(result.classId).toBe(4);
      expect(result.monsterId).toBe(1002);
      expect(result.monsterName).toBe('Poring');
      expect(result.skillName).toBe('Bash');
      expect(result.userId).toBe('user-1');
    });
  });

  describe('getSharedBuild', () => {
    it('should call supabase with correct id', (done) => {
      mockQueryBuilder.single.and.returnValue(
        Promise.resolve({
          data: { id: 'abc', name: 'Test', class_id: 1, model: {}, user_id: 'u1', created_at: '', updated_at: '' },
          error: null,
        })
      );

      service.getSharedBuild('abc').subscribe((result) => {
        expect(mockSupabaseService.client.from).toHaveBeenCalledWith('shared_builds');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'abc');
        expect(result.id).toBe('abc');
        done();
      });
    });
  });

  describe('createSharedBuild', () => {
    it('should insert with authenticated user_id', (done) => {
      mockQueryBuilder.single.and.returnValue(
        Promise.resolve({
          data: { id: 'new-id', name: 'My Build', class_id: 1, model: { class: 1 }, user_id: 'user-1', created_at: '', updated_at: '' },
          error: null,
        })
      );

      service.createSharedBuild({ name: 'My Build', model: { class: 1 } as any }).subscribe((result) => {
        expect(mockAuthService.getCurrentUserId).toHaveBeenCalled();
        expect(result.id).toBe('new-id');
        done();
      });
    });
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false`
Expected: FAIL — SharedBuildService not found

**Step 3: Write the service**

```typescript
// src/app/api-services/shared-build.service.ts
import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import { SharedBuild, SharedBuildListResponse, CreateSharedBuildRequest, UpdateSharedBuildRequest } from './models';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable()
export class SharedBuildService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService,
  ) {}

  private get client() {
    return this.supabaseService.client;
  }

  private getUserId$(): Observable<string> {
    return from(this.authService.getCurrentUserId()).pipe(
      switchMap((id) => (id ? [id] : throwError(() => new Error('Not authenticated')))),
    );
  }

  private mapBuildFromDb(row: any): SharedBuild {
    return {
      id: row.id,
      name: row.name,
      classId: row.class_id,
      model: row.model,
      monsterId: row.monster_id,
      monsterName: row.monster_name,
      skillName: row.skill_name,
      metrics: row.metrics,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id,
      likeCount: row.like_count || 0,
      liked: false,
    };
  }

  getSharedBuild(id: string): Observable<SharedBuild> {
    return from(
      this.client.from('shared_builds').select('*').eq('id', id).single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapBuildFromDb(data);
      }),
    );
  }

  getSharedBuilds(params: {
    classId?: number;
    userId?: string;
    skip: number;
    take: number;
  }): Observable<SharedBuildListResponse> {
    let query = this.client
      .from('shared_builds')
      .select('*, shared_build_likes(count)', { count: 'exact' });

    if (params.classId) {
      query = query.eq('class_id', params.classId);
    }
    if (params.userId) {
      query = query.eq('user_id', params.userId);
    }

    return from(
      query
        .order('created_at', { ascending: false })
        .range(params.skip, params.skip + params.take - 1),
    ).pipe(
      map(({ data, error, count }) => {
        if (error) throw error;
        const items = (data || []).map((row: any) => {
          const build = this.mapBuildFromDb(row);
          build.likeCount = row.shared_build_likes?.[0]?.count || 0;
          return build;
        });
        return { items, totalItem: count || 0, skip: params.skip, take: params.take };
      }),
    );
  }

  createSharedBuild(request: CreateSharedBuildRequest): Observable<SharedBuild> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('shared_builds')
            .insert({
              name: request.name,
              class_id: (request.model as any)?.class ?? null,
              model: request.model as any,
              monster_id: request.monsterId || null,
              monster_name: request.monsterName || null,
              skill_name: request.skillName || null,
              metrics: request.metrics as any || null,
              user_id: userId,
            })
            .select()
            .single(),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapBuildFromDb(data);
      }),
    );
  }

  updateSharedBuild(id: string, request: UpdateSharedBuildRequest): Observable<SharedBuild> {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (request.name !== undefined) updateData.name = request.name;
    if (request.model !== undefined) {
      updateData.model = request.model;
      updateData.class_id = (request.model as any)?.class ?? null;
    }
    if (request.monsterId !== undefined) updateData.monster_id = request.monsterId;
    if (request.monsterName !== undefined) updateData.monster_name = request.monsterName;
    if (request.skillName !== undefined) updateData.skill_name = request.skillName;
    if (request.metrics !== undefined) updateData.metrics = request.metrics;

    return from(
      this.client.from('shared_builds').update(updateData).eq('id', id).select().single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapBuildFromDb(data);
      }),
    );
  }

  deleteSharedBuild(id: string): Observable<void> {
    return from(
      this.client.from('shared_builds').delete().eq('id', id),
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  likeBuild(buildId: string): Observable<void> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client.from('shared_build_likes').insert({ build_id: buildId, user_id: userId }),
        ),
      ),
      map(({ error }: any) => {
        if (error) throw error;
      }),
    );
  }

  unlikeBuild(buildId: string): Observable<void> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client.from('shared_build_likes').delete().eq('build_id', buildId).eq('user_id', userId),
        ),
      ),
      map(({ error }: any) => {
        if (error) throw error;
      }),
    );
  }

  getLikedBuildIds(buildIds: string[]): Observable<Set<string>> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('shared_build_likes')
            .select('build_id')
            .eq('user_id', userId)
            .in('build_id', buildIds),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return new Set((data || []).map((r: any) => r.build_id));
      }),
    );
  }
}
```

**Step 4: Register the service**

In `src/app/api-services/api-service.module.ts`, add `SharedBuildService` to providers.

In `src/app/api-services/index.ts`, add:
```typescript
export * from './shared-build.service';
```

**Step 5: Run tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app/api-services/shared-build.service.ts src/app/api-services/shared-build.service.spec.ts src/app/api-services/api-service.module.ts src/app/api-services/index.ts
git commit -m "Add SharedBuildService with CRUD, like/unlike, and tests"
```

---

### Task 4: Replace export/import buttons with "Compartilhar" button

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.html:36-37`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.ts`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.module.ts`

**Step 1: Replace buttons in HTML**

In `ro-calculator.component.html`, replace lines 36-37 (the Exportar and Importar buttons) with:

```html
<button type="button" class="p-button-info" pButton icon="pi pi-share-alt" pTooltip="Compartilhar" [disabled]="!model.class" (click)="shareBuild()"></button>
```

**Step 2: Add share dialog HTML**

Add at the end of `ro-calculator.component.html` (before closing tag):

```html
<!-- Share Build Dialog -->
<p-dialog header="Compartilhar Build" [(visible)]="isShareDialogVisible" [modal]="true" [style]="{ width: '500px' }">
  <div class="grid grid-nogutter gap-3">
    <div class="col-12">
      <label class="font-semibold">Nome da Build</label>
      <input type="text" pInputText [(ngModel)]="shareBuildName" class="w-full mt-1" placeholder="Ex: RK Ignition PvM" />
    </div>
    <div class="col-12">
      <label class="font-semibold">Monstro Alvo</label>
      <div class="mt-1">{{ shareMonsterName || 'Nenhum selecionado' }}</div>
    </div>
    <div class="col-12">
      <label class="font-semibold">Skill Principal</label>
      <div class="mt-1">{{ model.selectedAtkSkill || '-' }}</div>
    </div>
    <div class="col-12" *ngIf="shareMetricsPreview">
      <label class="font-semibold">Métricas</label>
      <div class="grid grid-nogutter mt-1">
        <div class="col-4">DPS: <span class="text-primary font-semibold">{{ shareMetricsPreview.dps | number }}</span></div>
        <div class="col-4">Dano Max: <span class="text-primary font-semibold">{{ shareMetricsPreview.maxDamage | number }}</span></div>
        <div class="col-4">ASPD: <span class="text-primary font-semibold">{{ shareMetricsPreview.aspd }}</span></div>
      </div>
    </div>
  </div>
  <ng-template pTemplate="footer">
    <div class="flex gap-2 justify-content-between w-full" *ngIf="importedSharedBuildId && importedSharedBuildUserId === currentUserId">
      <button pButton label="Atualizar Existente" icon="pi pi-refresh" class="p-button-warning" [loading]="isShareProcessing" (click)="updateExistingSharedBuild()"></button>
      <button pButton label="Criar Nova" icon="pi pi-plus" class="p-button-success" [loading]="isShareProcessing" [disabled]="!shareBuildName" (click)="createNewSharedBuild()"></button>
    </div>
    <div *ngIf="!importedSharedBuildId || importedSharedBuildUserId !== currentUserId">
      <button pButton label="Publicar" icon="pi pi-send" class="p-button-success" [loading]="isShareProcessing" [disabled]="!shareBuildName" (click)="createNewSharedBuild()"></button>
    </div>
  </ng-template>
</p-dialog>
```

**Step 3: Add share logic to component TS**

In `ro-calculator.component.ts`:

- Add import for `SharedBuildService` and `SharedBuildMetrics`
- Add properties:

```typescript
// Share build
isShareDialogVisible = false;
shareBuildName = '';
shareMonsterName = '';
shareMetricsPreview: SharedBuildMetrics | null = null;
isShareProcessing = false;
importedSharedBuildId: string | null = null;
importedSharedBuildUserId: string | null = null;
currentUserId: string | null = null;
```

- Add `SharedBuildService` to constructor injection
- Add methods:

```typescript
shareBuild() {
  if (!this.isLoggedIn) {
    this.messageService.add({ severity: 'warn', summary: 'Login necessário', detail: 'Faça login para compartilhar builds.' });
    return;
  }

  const className = ClassID[this.model.class] || '';
  const skillName = this.model.selectedAtkSkill || '';
  this.shareBuildName = `${className} - ${skillName}`.trim().replace(/ - $/, '');
  this.shareMonsterName = this.monsterDataMap[this.selectedMonster]?.name || '';
  this.shareMetricsPreview = this.buildMetricsSnapshot();
  this.currentUserId = this.authService.getProfile()?.id || null;
  this.isShareDialogVisible = true;
}

private buildMetricsSnapshot(): SharedBuildMetrics {
  const s = this.totalSummary;
  return {
    dps: s?.dmg?.skillDps || 0,
    maxDamage: s?.dmg?.skillMaxDamage || 0,
    minDamage: s?.dmg?.skillMinDamage || 0,
    aspd: s?.calc?.totalAspd || 0,
    hitPerSecs: s?.calc?.hitPerSecs || 0,
    totalHit: s?.calc?.totalHit || 0,
    criRate: s?.calc?.totalCri || 0,
    criDmg: s?.criDmg || 0,
    vct: s?.vct || 0,
    fct: s?.fct || 0,
    acd: s?.acd || 0,
    hp: s?.hp || 0,
    sp: s?.sp || 0,
  };
}

createNewSharedBuild() {
  this.isShareProcessing = true;
  const data = toUpsertPresetModel(this.model, this.selectedCharacter);
  this.sharedBuildService.createSharedBuild({
    name: this.shareBuildName,
    model: data,
    monsterId: this.selectedMonster,
    monsterName: this.shareMonsterName,
    skillName: this.model.selectedAtkSkill,
    metrics: this.shareMetricsPreview,
  }).pipe(
    finalize(() => { this.isShareProcessing = false; }),
  ).subscribe({
    next: (build) => {
      this.importedSharedBuildId = build.id;
      this.importedSharedBuildUserId = build.userId;
      this.isShareDialogVisible = false;
      this.messageService.add({ severity: 'success', summary: 'Build compartilhada!' });
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: err?.message || 'Falha ao compartilhar.' });
    },
  });
}

updateExistingSharedBuild() {
  if (!this.importedSharedBuildId) return;
  this.isShareProcessing = true;
  const data = toUpsertPresetModel(this.model, this.selectedCharacter);
  this.sharedBuildService.updateSharedBuild(this.importedSharedBuildId, {
    name: this.shareBuildName,
    model: data,
    monsterId: this.selectedMonster,
    monsterName: this.shareMonsterName,
    skillName: this.model.selectedAtkSkill,
    metrics: this.shareMetricsPreview,
  }).pipe(
    finalize(() => { this.isShareProcessing = false; }),
  ).subscribe({
    next: () => {
      this.isShareDialogVisible = false;
      this.messageService.add({ severity: 'success', summary: 'Build atualizada!' });
    },
    error: (err) => {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: err?.message || 'Falha ao atualizar.' });
    },
  });
}
```

- Remove `exportBuild()` and `importBuild()` methods (lines 2978-3017)

**Step 4: Add DialogModule if not already imported**

In `ro-calculator.module.ts`, `DialogModule` is already imported (line 43/87). No change needed.

**Step 5: Run tests**

Run: `npx ng test --watch=false`
Expected: PASS (existing tests should still pass)

**Step 6: Commit**

```bash
git add src/app/layout/pages/ro-calculator/ro-calculator.component.html src/app/layout/pages/ro-calculator/ro-calculator.component.ts src/app/layout/pages/ro-calculator/ro-calculator.module.ts
git commit -m "Replace export/import buttons with share build dialog"
```

---

### Task 5: Add route for shared build link + auto-load in calculator

**Files:**
- Modify: `src/app/app-routing.module.ts`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.ts`

**Step 1: Add route parameter**

In `app-routing.module.ts`, add a new route BEFORE the wildcard:

```typescript
{
  path: 'shared-presets/:id',
  redirectTo: '',
  // The actual loading is handled by query params
},
```

Actually, a better approach: use query params on the calculator route. Change the `shared-presets/:id` route to redirect to the calculator with a query param:

In `ro-calculator.component.ts`, in `ngOnInit()`, add logic to check for query param `sharedBuildId`:

```typescript
// In ngOnInit, after initData:
this.route.queryParams.pipe(take(1)).subscribe((params) => {
  if (params['sharedBuildId']) {
    this.loadSharedBuildById(params['sharedBuildId']);
  }
});
```

Add the `loadSharedBuildById` method:

```typescript
private loadSharedBuildById(id: string) {
  this.sharedBuildService.getSharedBuild(id).subscribe({
    next: (build) => {
      this.importedSharedBuildId = build.id;
      this.importedSharedBuildUserId = build.userId;
      this.loadItemSet(build.model).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Build carregada' });
      });
    },
    error: () => {
      this.messageService.add({ severity: 'error', summary: 'Build não encontrada' });
    },
  });
}
```

Update `app-routing.module.ts` — change the `shared-presets/:id` route:

```typescript
{
  path: 'shared-presets/:id',
  redirectTo: '',
  // The shared-preset page handles the redirect via router.navigate
},
```

Actually the simplest approach is to handle it in the shared-preset routing module. When the path is `/shared-presets/:id`, redirect to `/?sharedBuildId=:id`. This needs a guard or component.

Simpler: add `ActivatedRoute` to the calculator component, check for route param or query param on init.

Add to `app-routing.module.ts`:

```typescript
{
  path: 'b/:id',  // short URL for shared builds
  component: AppLayoutComponent,
  children: [
    {
      path: '',
      loadChildren: () =>
        import('./layout/pages/ro-calculator/ro-calculator.module').then((m) => m.RoCalculatorModule),
    },
  ],
  data: { isSharedBuild: true },
},
```

In the calculator component, check `this.route.parent?.snapshot.params['id']` or use `ActivatedRoute`.

**Best approach:** Keep it simple. In `app-routing.module.ts`, add the route. In the calculator, inject `ActivatedRoute`, check for the `id` param.

**Step 2: Inject ActivatedRoute in calculator**

Add `ActivatedRoute` to constructor. In `ngOnInit`, after data loads:

```typescript
import { ActivatedRoute, Router } from '@angular/router';

// In constructor:
private readonly route: ActivatedRoute,
private readonly router: Router,

// In ngOnInit, after initData completes:
const sharedBuildId = this.route.snapshot.queryParams['sharedBuildId'];
if (sharedBuildId) {
  this.loadSharedBuildById(sharedBuildId);
  // Clean URL
  this.router.navigate([], { queryParams: {}, replaceUrl: true });
}
```

**Step 3: Commit**

```bash
git add src/app/app-routing.module.ts src/app/layout/pages/ro-calculator/ro-calculator.component.ts
git commit -m "Add shared build link loading via query param"
```

---

### Task 6: Rewrite shared-preset page

**Files:**
- Modify: `src/app/layout/pages/shared-preset/shared-preset.component.ts`
- Modify: `src/app/layout/pages/shared-preset/shared-preset.component.html`
- Modify: `src/app/layout/pages/shared-preset/shared-preset.module.ts`
- Modify: `src/app/layout/pages/shared-preset/shared-preset-routing.module.ts`

**Step 1: Update the module**

In `shared-preset.module.ts`, add `SharedBuildService` import and add `ClipboardModule` if needed (or just use `navigator.clipboard`).

**Step 2: Rewrite the component TS**

Replace `shared-preset.component.ts` entirely. Key changes:
- Use `SharedBuildService` instead of `PresetService.getPublishPresets()`
- Remove all `preset_tags` logic
- Add `showMyBuilds` toggle
- Add `copyLink(buildId)` method using `navigator.clipboard`
- Add `deleteBuild(buildId)` method (author only)
- Add `importBuild(build)` method — navigates to `/?sharedBuildId=id`
- Add `likeBuild(buildId)` / `unlikeBuild(buildId)` — only for logged-in users
- Keep monster selection + battle summary calculation for comparing builds
- Fetch liked build IDs on page load (if logged in)

**Step 3: Rewrite the component HTML**

Replace `shared-preset.component.html` entirely. Key changes:
- Card shows: name, equipments, stats, metrics snapshot, skill name, monster name
- `pi pi-link` icon button — calls `copyLink(build.id)`, visible for all
- Like/unlike buttons — `*ngIf="isLoggedIn"` only
- `pi pi-trash` icon — `*ngIf="build.userId === currentUserId"`, with confirmation
- "Importar" button — `*ngIf="isLoggedIn"`, navigates to calculator with build loaded
- "Minhas Builds" toggle — `*ngIf="isLoggedIn"`
- Sort by date (default, already from query)

**Step 4: Add route for individual build**

In `shared-preset-routing.module.ts`, add:

```typescript
{ path: ':id', component: SharedPresetComponent }
```

In the component, check `ActivatedRoute` params. If `:id` is present, redirect to calculator:

```typescript
ngOnInit() {
  const buildId = this.route.snapshot.params['id'];
  if (buildId) {
    this.router.navigate(['/'], { queryParams: { sharedBuildId: buildId } });
    return;
  }
  // ... normal init
}
```

**Step 5: Run tests**

Run: `npx ng test --watch=false`

**Step 6: Commit**

```bash
git add src/app/layout/pages/shared-preset/
git commit -m "Rewrite shared-preset page to use shared_builds table"
```

---

### Task 7: Remove old sharing code

**Files:**
- Modify: `src/app/api-services/preset.service.ts` — remove methods: `sharePreset`, `unsharePreset`, `addPresetTags`, `removePresetTag`, `likePresetTags`, `unlikePresetTag`, `getPublishPresets`, `mapTagFromDb`
- Modify: `src/app/layout/pages/ro-calculator/preset-table/preset-table.component.ts` — remove: `sharePreset()`, `unsharePreset()`, `addTags()`, `isSharedPreset`, `selectedTags`, `currentTags`, `availableTags`, `tagSeverityMap`
- Modify: `src/app/layout/pages/ro-calculator/preset-table/preset-table.component.html` — remove: share name input, share/unshare buttons, tags multiselect section, shared-related display fields
- Delete: `src/app/api-services/models/publish-preset-model.ts`
- Delete: `src/app/api-services/models/published-presets.response.ts`
- Delete: `src/app/api-services/models/preset-tag.model.ts`
- Delete: `src/app/api-services/models/like-tag.response.ts`
- Modify: `src/app/api-services/models/index.ts` — remove the 4 deleted model exports
- Modify: `src/app/api-services/models/ro-preset-model.ts` — remove `publishName`, `isPublished`, `publishedAt` fields
- Modify: `src/app/api-services/preset.service.ts` — remove `publishName`, `isPublished`, `publishedAt` from `mapPresetFromDb`

**Step 1: Remove model files**

Delete the 4 model files listed above.

**Step 2: Update barrel exports**

Remove the 4 lines from `src/app/api-services/models/index.ts`.

**Step 3: Clean PresetService**

Remove the 7 methods and `mapTagFromDb` from `preset.service.ts`.
Remove `publishName`, `isPublished`, `publishedAt` from `mapPresetFromDb`.

**Step 4: Clean RoPresetModel**

Remove `publishName`, `isPublished`, `publishedAt` from `ro-preset-model.ts`.

**Step 5: Clean PresetTableComponent**

Remove share/unshare/tags logic from TS and HTML.

**Step 6: Remove exportBuild/importBuild from calculator**

These were already removed in Task 4 but verify they're gone.

**Step 7: Run tests**

Run: `npx ng test --watch=false`
Expected: PASS

**Step 8: Build check**

Run: `npx ng build`
Expected: BUILD SUCCESS — no broken imports/references

**Step 9: Commit**

```bash
git add -A
git commit -m "Remove old preset sharing code (preset_tags, publish, export/import)"
```

---

### Task 8: Write integration tests for shared-preset page

**Files:**
- Create: `src/app/layout/pages/shared-preset/shared-preset.component.spec.ts`

**Step 1: Write tests**

Test cases:
- Component creates successfully
- Loads builds on init (mocked SharedBuildService)
- Filters by class
- Shows "Minhas Builds" toggle only when logged in
- copyLink copies to clipboard
- Like/unlike buttons only visible when logged in
- Delete button only visible for build author
- Import navigates to calculator with query param

**Step 2: Run tests**

Run: `npx ng test --watch=false`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/layout/pages/shared-preset/shared-preset.component.spec.ts
git commit -m "Add integration tests for shared-preset page"
```

---

### Task 9: Final verification and build

**Step 1: Run all tests**

Run: `npx ng test --watch=false`
Expected: All PASS

**Step 2: Production build**

Run: `MSYS_NO_PATHCONV=1 npx ng build --base-href /rolatam-calc/`
Expected: BUILD SUCCESS

**Step 3: Manual smoke test**

Start dev server: `npx ng serve`
Verify:
- [ ] Calculator loads normally
- [ ] "Compartilhar" button visible in context bar
- [ ] Click "Compartilhar" without login → shows warning
- [ ] Login → click "Compartilhar" → dialog opens with suggested name
- [ ] Publish → build appears in "Builds Compartilhadas" page
- [ ] Copy link icon works
- [ ] Open link in incognito → build loads in calculator
- [ ] Like/unlike works (logged in only)
- [ ] "Minhas Builds" toggle works
- [ ] Author can delete own build
- [ ] Import loads build as copy in calculator
- [ ] Re-share imported build (as author) → asks "update or create new"

**Step 4: Commit any fixes**

---

## Task Dependency Order

```
Task 1 (SQL) → Task 2 (models) → Task 3 (service) → Task 4 (share button)
                                                    → Task 5 (link loading)
                                                    → Task 6 (rewrite page)
                                                    → Task 7 (remove old code)
                                                    → Task 8 (integration tests)
                                                    → Task 9 (final verification)
```

Tasks 4, 5, 6 can be done in parallel after Task 3. Task 7 should be done after 4+5+6 are complete. Task 8 after 6. Task 9 is always last.
