import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Constants } from 'src/app/shared/constants/constants';

@Component({
  selector: 'm-table',
  templateUrl: './m-table.component.html',
  styleUrls: ['./m-table.component.scss']
})
export class MTableComponent implements OnInit, AfterViewInit {
  ACTIONS = Constants.ACTIONS;
  //   listDataTypeOT: any[];
  selectedItem:any = [];
  @Input() items: any[] = [];
  @Input() cols: any[] = [];
  @Input() selectionMode = "single";
  @Input() actions: any[] = [Constants.ACTIONS.EDIT, Constants.ACTIONS.DELETE];
  @Input() totalRecords = 0;
  @Input() dataKey = '';
  @Input() loading = false;
  @Input() isLazyLoad = false; // server-side pagination
  @Input() take = 40;
  @Input() calcHeight = 225;
  @Input() actionColWidth = '6rem';
  @Input() tableStyleClass = 'p-datatable-xs';
  @Input() customHeaderTemplate!: TemplateRef<any>;
  @Input() customBodyTemplate!: TemplateRef<any>;
  @Input() additionButtonsTemplate!: TemplateRef<any>;
  @Input() rowDblClickFunc = "onEditItem";
  @Input() indexColumnWidth = "4%";
  @Input() lazyLoadOnInit = true;
  @Output() onEditItem = new EventEmitter<any>();
  @Output() onDeleteItem = new EventEmitter<any>();
  @Output() selectRow = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onRowDblClick = new EventEmitter<any>();
  @ViewChild("dt", {read: ElementRef}) dataTable!: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.selectedItem = this.selectionMode =="single"?{}:[];
  }

  ngAfterViewInit():void{
    const parentElement = this.dataTable.nativeElement;
    const pDatatableWrapper = parentElement.querySelector(".p-datatable-wrapper");
    pDatatableWrapper.style.height=`calc(100vh - ${this.calcHeight}px)`
  }

  rowDblClick(data: any) {
    if (this.rowDblClickFunc == "onEditItem") {
      this[this.rowDblClickFunc].emit(data);
    } else {
      this.onRowDblClick.emit(data);
    }
  }
}
