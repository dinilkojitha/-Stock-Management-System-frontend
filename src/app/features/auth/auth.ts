import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Role, UserRequest, UserResponse, DepartmentResponse } from '../../models/domain.models';

@Component({
  selector: 'app-Auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './auth.css',
  templateUrl: './auth.html',
})
export class Auth implements OnInit {
  private api = inject(ApiService);

  activeTab = signal<'users' | 'roles'>('users');
  activeModal = signal<'none' | 'user' | 'role'>('none');
  isEditing = signal(false);
  editId = signal<number>(0);

  // Data
  users = signal<UserResponse[]>([]);
  roles = signal<Role[]>([]);
  departments = signal<DepartmentResponse[]>([]);

  // Forms
  userForm: UserRequest = {
    fullName: '',
    email: '',
    phoneNumber: '',
    roleId: 0,
    departmentId: 0,
    password: '',
  };
  roleForm: Role = { name: '', accessLevel: 50 };

  ngOnInit() {
    this.loadData();
    this.api.getAllDepartments().subscribe((deps) => this.departments.set(deps));
  }

  setTab(tab: 'users' | 'roles') {
    this.activeTab.set(tab);
    this.loadData();
  }

  loadData() {
    if (this.activeTab() === 'users') {
      this.api.getUsers().subscribe((res) => this.users.set(res));
      this.api.getRoles().subscribe((res) => this.roles.set(res)); // Needed for dropdowns
    } else {
      this.api.getRoles().subscribe((res) => this.roles.set(res));
    }
  }

  // --- User Operations ---
  openUserModal(user?: UserResponse) {
    if (user) {
      this.isEditing.set(true);
      this.editId.set(user.id);
      this.userForm = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleId: user.roleId,
        departmentId: user.departmentId,
        password: '', // Backend ignores blank passwords on update
      };
    } else {
      this.isEditing.set(false);
      this.userForm = {
        fullName: '',
        email: '',
        phoneNumber: '',
        roleId: 0,
        departmentId: 0,
        password: '',
      };
    }
    this.activeModal.set('user');
  }

  saveUser() {
    if (!this.userForm.roleId || !this.userForm.departmentId) {
      alert('Role and Department are required.');
      return;
    }

    const request = this.isEditing()
      ? this.api.updateUser(this.editId(), this.userForm)
      : this.api.createUser(this.userForm);

    request.subscribe({
      next: () => {
        this.activeModal.set('none');
        this.loadData();
      },
      error: (err) => alert('Failed to save user: ' + err.message),
    });
  }

  deleteUser(id: number) {
    if (confirm('Permanently delete this user?')) {
      this.api.deleteUser(id).subscribe(() => this.loadData());
    }
  }

  // --- Role Operations ---
  openRoleModal(role?: Role) {
    if (role) {
      this.isEditing.set(true);
      this.editId.set(role.id!);
      this.roleForm = { name: role.name, accessLevel: role.accessLevel };
    } else {
      this.isEditing.set(false);
      this.roleForm = { name: '', accessLevel: 50 };
    }
    this.activeModal.set('role');
  }

  saveRole() {
    const request = this.isEditing()
      ? this.api.updateRole(this.editId(), this.roleForm)
      : this.api.createRole(this.roleForm);

    request.subscribe({
      next: () => {
        this.activeModal.set('none');
        this.loadData();
      },
      error: (err) => alert('Failed to save role: ' + err.message),
    });
  }

  deleteRole(id: number) {
    if (confirm('Delete this role? This will fail if users are assigned to it.')) {
      this.api.deleteRole(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Cannot delete role: It is currently assigned to one or more users.'),
      });
    }
  }
}
