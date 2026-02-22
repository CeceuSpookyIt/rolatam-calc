import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { createBonusNameList, prettyItemDesc } from '../../../../utils';
import { DropdownModel } from '../../../../models/dropdown.model';
import { ItemModel } from '../../../../models/item.model';
import { Observable, Subject, Subscription, debounceTime, tap } from 'rxjs';

const positions: DropdownModel[] = [
  { value: 'weaponList', label: 'Arma' },
  { value: 'weaponCardList', label: 'Carta de Arma' },

  { value: 'shieldList', label: 'Escudo' },
  { value: 'shieldCardList', label: 'Carta de Escudo' },

  { value: 'headUpperList', label: 'Cabeça Superior' },
  { value: 'headMiddleList', label: 'Cabeça Meio' },
  { value: 'headLowerList', label: 'Cabeça Inferior' },
  { value: 'headCardList', label: 'Carta de Cabeça' },

  { value: 'enchants', label: 'Pedra de Encantamento' },

  { value: 'armorList', label: 'Armadura' },
  { value: 'armorCardList', label: 'Carta de Armadura' },
  { value: 'garmentList', label: 'Capa' },
  { value: 'garmentCardList', label: 'Carta de Capa' },
  { value: 'bootList', label: 'Bota' },
  { value: 'bootCardList', label: 'Carta de Bota' },
  { value: 'accList', label: 'Acessório' },
  { value: 'accCardList', label: 'Carta de Acessório' },

  { value: 'petList', label: 'Mascote' },

  { value: 'costumeList', label: 'Traje' },

  { value: 'shadowWeaponList', label: 'Sombra Arma' },
  { value: 'shadowArmorList', label: 'Sombra Armadura' },
  { value: 'shadowShieldList', label: 'Sombra Escudo' },
  { value: 'shadowBootList', label: 'Sombra Bota' },
  { value: 'shadowEarringList', label: 'Sombra Brinco' },
  { value: 'shadowPendantList', label: 'Sombra Pingente' },
];

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['../ro-calculator.component.css', './item-search.component.css'],
})
export class ItemSearchComponent implements OnInit, OnDestroy {
  @Input({ required: true }) items!: Record<number, ItemModel>;
  @Input({ required: true }) selectedCharacter: any;
  @Input({ required: true }) equipableItems: (DropdownModel & { id: number; position: string })[];
  @Input({ required: true }) offensiveSkills: DropdownModel[] = [];
  @Input({ required: true }) onClassChanged: Observable<boolean>;

  private subscription: Subscription;
  private subscription2: Subscription;

  private selectItemSource = new Subject<number>();
  private onSelectItemChange$ = this.selectItemSource.asObservable();

  isShowSearchDialog = false;
  itemPositionOptions = positions;
  selectedItemPositions: string[] = [];
  itemSearchFirst = 0;
  totalFilteredItems = 0;

  bonusNameList = createBonusNameList() as any[];
  selectedBonus: string[] = [];

  filteredItems: DropdownModel[] = [];
  isSerchMatchAllBonus = true;
  selectedFilteredItem: string;
  activeFilteredItemDesc: string;
  activeFilteredItem: (typeof this.equipableItems)[0];
  seletedItemId = 0;

  selectedOffensiveSkills: string[] = [];

  ngOnInit(): void {
    this.bonusNameList.push(
      {
        label: 'FCT',
        value: 'fct',
      },
      {
        label: 'Perfect Dodge',
        value: 'perfectDodge',
      },
      {
        label: 'Reduz Cooldown',
        value: 'cd__',
      },
    );

    this.subscription = this.onClassChanged.subscribe(() => {
      this.clearItemSearch();
    });
    this.subscription2 = this.onSelectItemChange$
      .pipe(
        tap(() => (this.seletedItemId = null)),
        debounceTime(50),
      )
      .subscribe((itemId) => {
        this.seletedItemId = itemId;
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

  onItemSearchFilterChange() {
    let isIncludeCdReduction = false;
    const selectedBonus = [
      ...this.selectedBonus.filter(Boolean).filter((v) => {
        if (v === 'cd__') {
          isIncludeCdReduction = true;
          return false;
        }

        return true;
      }),
    ];
    const selectedPositions = new Set([...(this.selectedItemPositions || []).filter(Boolean)]);

    const displayItems = [];
    for (const equipableItem of this.equipableItems) {
      const item = this.items[equipableItem.value] as ItemModel;
      if (!item?.script) {
        console.log('No Script', { item, equipableItem });
        continue;
      }
      if (selectedPositions.size > 0 && !selectedPositions.has(equipableItem.position)) continue;
      let isFoundCD = false;
      if (this.selectedOffensiveSkills?.length > 0) {
        if (isIncludeCdReduction) {
          isFoundCD = this.selectedOffensiveSkills.some((skillName) => item.script[`cd__${skillName}`]);
        } else {
          const found = this.selectedOffensiveSkills.some(
            (skillName) =>
              item.script[skillName] ||
              item.script[`chance__${skillName}`] ||
              item.script[`cd__${skillName}`] ||
              item.script[`vct__${skillName}`] ||
              item.script[`fct__${skillName}`] ||
              item.script[`fix_vct__${skillName}`],
          );
          if (!found) continue;
        }
      }

      let foundBonus = false;
      if (isIncludeCdReduction) {
        foundBonus =
          this.isSerchMatchAllBonus || selectedBonus.length === 0
            ? isFoundCD && selectedBonus.every((bonus) => item.script[bonus])
            : isFoundCD || selectedBonus.some((bonus) => item.script[bonus]);
      } else {
        foundBonus =
          this.isSerchMatchAllBonus || selectedBonus.length === 1
            ? selectedBonus.every((bonus) => item.script[bonus])
            : selectedBonus.some((bonus) => item.script[bonus]);
      }

      // const foundBonus =
      //   this.isSerchMatchAllBonus || selectedBonus.length === 1 || (selectedBonus.length === 0 && isIncludeCdReduction)
      //     ? isFoundCD && selectedBonus.every((bonus) => item.script[bonus])
      //     : isFoundCD || selectedBonus.length === 0 || selectedBonus.some((bonus) => item.script[bonus]);
      if (foundBonus) {
        displayItems.push(equipableItem);
      }
    }
    this.totalFilteredItems = displayItems.length;
    this.filteredItems = displayItems;
    this.activeFilteredItem = undefined;
    this.activeFilteredItemDesc = undefined;
    this.selectItemSource.next(null);
    setTimeout(() => {
      this.itemSearchFirst = 0;
    }, 10);
  }

  onSelectFilteredItem(item: any) {
    // console.log({ item, activeFilteredItemID: this.activeFilteredItemID });
    // console.log({ item });
    this.selectItemSource.next((item as (typeof this.equipableItems)[0]).value as number);

    this.activeFilteredItemDesc = prettyItemDesc(this.items[this.activeFilteredItem?.id]?.description);
  }

  private clearItemSearch() {
    this.filteredItems = [];
    this.selectedOffensiveSkills = [];
    this.totalFilteredItems = 0;
    this.itemSearchFirst = 0;
    this.selectedFilteredItem = undefined;
    this.activeFilteredItem = undefined;
    this.activeFilteredItemDesc = undefined;
  }

  showSearchDialog() {
    this.isShowSearchDialog = true;
  }
}
