import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import {
  BranchResponse,
  DepartmentResponse,
  BranchPerformanceResponse,
  BranchRequest,
  DepartmentRequest,
} from '../../models/domain.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [FormsModule], // Removed NgClass as it is no longer needed
  styleUrl: './organization.css',
  templateUrl: './organization.html',
})
export class Organization implements OnInit {
  private api = inject(ApiService);

  // State Signals
  branches = signal<BranchResponse[]>([]);
  departments = signal<DepartmentResponse[]>([]);
  performances = signal<BranchPerformanceResponse[]>([]);
  selectedBranchId = signal<number | null>(null);
  editingBranchId = signal<number | null>(null);
  editingDepartmentId = signal<number | null>(null);
  branchEdit: BranchRequest = { branchName: '', location: '' };
  departmentEdit: DepartmentRequest = { departmentName: '', location: '', branchId: 0 };

  get visibleDepartments(): DepartmentResponse[] {
    const branchId = this.selectedBranchId();
    return branchId === null
      ? this.departments()
      : this.departments().filter((department) => department.branchId === branchId);
  }

  // Simple form models
  newBranch: BranchRequest = { branchName: '', location: '' };
  newDept: DepartmentRequest = { departmentName: '', location: '', branchId: 0 };

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadBranches();
    this.loadDepartments();
    this.loadPerformances();
  }

  // --- Branch Operations ---
  loadBranches() {
    this.api.getAllBranches().subscribe({
      next: (d) => {
        console.log(d);
        this.branches.set(d)},
      error: (err) => console.error('Failed to load branches', err),
    });
  }

  loadPerformances() {
    this.api.getAllBranchPerformance().subscribe({
      next: (d) => this.performances.set(d),
    });
  }

  createBranch() {
    if (!this.newBranch.branchName) return;
    this.api.createBranch(this.newBranch).subscribe({
      next: () => {
        this.loadBranches();
        this.newBranch = { branchName: '', location: '' }; // reset
      },
    });
  }

  selectBranch(branchId: number | null) {
    this.selectedBranchId.set(branchId);
  }

  startBranchEdit(branch: BranchResponse) {
    this.editingBranchId.set(branch.id);
    this.branchEdit = {
      branchName: branch.branchName || branch.name,
      location: branch.location,
    };
  }

  saveBranchEdit() {
    const id = this.editingBranchId();
    if (id === null || !this.branchEdit.branchName.trim()) return;
    this.api.updateBranch(id, this.branchEdit).subscribe({
      next: () => {
        this.editingBranchId.set(null);
        this.loadAllData();
      },
      error: (err) => alert('Could not update branch: ' + (err?.error?.message || err.message)),
    });
  }

  cancelBranchEdit() {
    this.editingBranchId.set(null);
  }

  deleteBranch(id: number) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.api.deleteBranch(id).subscribe({
        next: () => this.loadAllData(),
        error: (err) => alert('Cannot delete branch: ' + err.message),
      });
    }
  }

  // --- Department Operations ---
  loadDepartments() {
    this.api.getAllDepartments().subscribe({
      next: (d) => this.departments.set(d),
    });
  }

  createDepartment() {
    if (!this.newDept.departmentName || !this.newDept.branchId) return;
    this.api.createDepartment(this.newDept).subscribe({
      next: () => {
        this.loadDepartments();
        this.newDept = { departmentName: '', location: '', branchId: 0 }; // reset
      },
    });
  }

  startDepartmentEdit(department: DepartmentResponse) {
    this.editingDepartmentId.set(department.id);
    this.departmentEdit = {
      departmentName: department.departmentName,
      location: department.location,
      branchId: department.branchId,
    };
  }

  saveDepartmentEdit() {
    const id = this.editingDepartmentId();
    if (id === null || !this.departmentEdit.departmentName.trim() || !this.departmentEdit.branchId) return;
    this.api.updateDepartment(id, this.departmentEdit).subscribe({
      next: () => {
        this.editingDepartmentId.set(null);
        this.loadDepartments();
      },
      error: (err) => alert('Could not update department: ' + (err?.error?.message || err.message)),
    });
  }

  cancelDepartmentEdit() {
    this.editingDepartmentId.set(null);
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.api.deleteDepartment(id).subscribe({
        next: () => this.loadDepartments(),
        error: (err) => alert('Cannot delete department: ' + err.message),
      });
    }
  }
}
