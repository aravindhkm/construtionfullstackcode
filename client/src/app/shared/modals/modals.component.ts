import { Component, TemplateRef, Input, ElementRef, ViewChild, OnInit, EventEmitter, Output } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-modal',
  templateUrl: './modals.component.html'
})
export class ModalComponent implements OnInit {
    @Input() title: string;
    @Input() message: string;
    @Input() btnOkText: string;
    @Input() btnCancelText: string;
    @Output() action = new EventEmitter();
    // onClose: Subject<boolean>;

    constructor(private modalService: BsModalService,
      public  modalRef: BsModalRef
    ) {}

    ngOnInit() {

    }
    // Cancel
    decline() {
        this.modalRef.hide();
        this.action.emit(false);
    }

    // OK confirmation
    accept() {
        this.modalRef.hide();
        this.action.emit(true);
    }

    // Closing the Popup
    dismiss() {
        this.modalRef.hide();
        this.action.emit(null);
    }
}
