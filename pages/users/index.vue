<template>
  <div class="h-screen">
    <Navbar hideItem="/users" />
    <div class="mt-2 ">
      <div class="flex flex-row justify-end mx-3">
        <Button label="Add New User" icon="pi pi-plus" class="p-button-success mb-4 w-[15%]"
          @click="showAddUserDialog = true" />
      </div>
      <Dialog header="Add New User" v-model:visible="showAddUserDialog" modal>
        <form @submit.prevent="onAddUser">
          <div class="flex flex-wrap align-items-center mb-3 gap-2">
            <label for="username" class="p-sr-only">Username</label>
            <InputText id="username" placeholder="username" class="ml-2" v-model="newUser.username" required />
          </div>
          <div class="flex flex-wrap align-items-center mb-3 gap-2">
            <label for="password" class="p-sr-only">Password</label>
            <InputText id="password" placeholder="password" class="ml-2" v-model="newUser.password" required />
          </div>
          <Button label="Add User" type="submit" class="p-button-success" />
        </form>
      </Dialog>
      <DataTable v-model:editingRows="editingRows" :value="users" editMode="row" dataKey="userID"
        @row-edit-save="onRowEdit" :pt="{
          table: { style: 'min-width: 50rem' },
          column: {
            bodycell: ({ state  }:any ) => ({
              style: state['d_editing'] && 'padding-top: 0.6rem; padding-bottom: 0.6rem'
            })
          }
        }">
        <Column field="user_id" header="ID" style="width: 20%">
          <template #body="{ data, field }">
            {{ data[field] }}
          </template>
        </Column>
        <Column field="username" header="Username" style="width: 20%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column field="password" header="Password" style="width: 20%">
          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"></Column>
        <Column style="width: 10%; min-width: 8rem" bodyStyle="text-align:center">
          <template #body="{ data }">
            <Button icon="pi pi-trash" class="p-button-danger" @click="onRowDelete(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {useFetch} from '#app';
  import InputText from 'primevue/inputtext';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import {useToast} from "primevue/usetoast";
  const toast = useToast();

  const config = useRuntimeConfig()
  interface User {
    user_id: number
    username: string
    password: string
  }

  const editingRows = ref([]);
  const newUser = ref < User > ({user_id: 0, username: '', password: ''});
  const showAddUserDialog = ref(false);

  const {data: users, error, refresh} = await useFetch < User[] > ('/users', {
    baseURL: config.public.apiBase
  });
  if (error.value){

      toast.add({severity: 'error', summary: 'Error', detail: 'Failed to fetch user', life: 3000});
  }
   

  const onRowEdit = async (event: any) => {
    const data = event.newData as User;
    try {
      await $fetch(`/users?id=${data.user_id}`, {
        baseURL: config.public.apiBase,
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      refresh();
      toast.add({severity: 'success', summary: 'Success', detail: 'User updated successfully', life: 3000});
    } catch (error) {
      console.error('Error saving user:', error);
      toast.add({severity: 'error', summary: 'Error', detail: 'Failed to update user', life: 3000});
    }
  };

  const onRowDelete = async (data: User) => {
    try {
      await $fetch(`/users?id=${data.user_id}`, {
        baseURL: config.public.apiBase,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      refresh();
      toast.add({severity: 'success', summary: 'Success', detail: 'User deleted successfully', life: 3000});
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.add({severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000});
    }
  };

  const onAddUser = async () => {
    try {
      await $fetch('/users', {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: JSON.stringify(newUser.value),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      newUser.value = {user_id: 0, username: '', password: ''};
      showAddUserDialog.value = false;
      refresh();
      toast.add({severity: 'success', summary: 'Success', detail: 'User added successfully', life: 3000});
    } catch (error) {
      console.error('Error adding user:', error);
      toast.add({severity: 'error', summary: 'Error', detail: 'Failed to add user', life: 3000});
    }
  };
</script>
