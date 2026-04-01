import React, { useEffect, useMemo, useState } from "react";
import {
  deleteUserService,
  getAllUsersService,
  getAllRolesService,
  getUserDetailService,
  updateUserRoleService,
} from "../../services/User/UserService";
import { useNotification } from "../../components/common/NotificationStack";

const normalizePayload = (response) =>
  response?.data?.data ?? response?.data?.content;

const normalizeErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.content ||
  error?.message ||
  fallbackMessage;

const buildPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("...");
  for (let value = start; value <= end; value += 1) {
    items.push(value);
  }
  if (end < totalPages - 1) items.push("...");
  items.push(totalPages);

  return items;
};

const UserManagementPage = () => {
  const { showSuccess, showError } = useNotification();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [totalItem, setTotalItem] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [editingRoleUserId, setEditingRoleUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const pageItems = useMemo(
    () => buildPageItems(page, Math.max(totalPage, 1)),
    [page, totalPage],
  );

  const roleOptions = useMemo(() => {
    return (Array.isArray(roles) ? roles : [])
      .filter((role) => role?.id && role?.name)
      .map((role) => ({ id: role.id, name: role.name }));
  }, [roles]);

  const roleNameFilters = useMemo(() => {
    return roleOptions.map((role) => role.name);
  }, [roleOptions]);

  const loadRoles = async () => {
    try {
      const response = await getAllRolesService();
      const payload = normalizePayload(response);
      const items = Array.isArray(payload) ? payload : [];
      setRoles(items);
    } catch (error) {
      showError(
        "Load Roles Failed",
        normalizeErrorMessage(error, "Không thể tải danh sách role"),
      );
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);

    try {
      const response = await getAllUsersService({
        page,
        pageSize,
        keyword: keyword.trim() || undefined,
        role: roleFilter || undefined,
      });
      const payload = normalizePayload(response);
      const items = Array.isArray(payload?.items) ? payload.items : [];

      setUsers(items);
      setTotalPage(Number(payload?.totalPage || 1));
      setTotalItem(Number(payload?.totalItem || 0));
    } catch (error) {
      showError(
        "Load Users Failed",
        normalizeErrorMessage(error, "Không thể tải danh sách người dùng"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize]);

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(1);

    try {
      const response = await getAllUsersService({
        page: 1,
        pageSize,
        keyword: keyword.trim() || undefined,
        role: roleFilter || undefined,
      });
      const payload = normalizePayload(response);
      const items = Array.isArray(payload?.items) ? payload.items : [];
      setUsers(items);
      setTotalPage(Number(payload?.totalPage || 1));
      setTotalItem(Number(payload?.totalItem || 0));
    } catch (error) {
      showError(
        "Search Failed",
        normalizeErrorMessage(error, "Không thể tìm kiếm người dùng"),
      );
    }
  };

  const handleViewDetail = async (userId) => {
    if (!userId) return;
    setIsDetailLoading(true);

    try {
      const response = await getUserDetailService(userId);
      const payload = normalizePayload(response);
      setSelectedUser(payload || null);
    } catch (error) {
      showError(
        "Load User Detail Failed",
        normalizeErrorMessage(error, "Không thể tải chi tiết người dùng"),
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleStartEditRole = (user) => {
    setEditingRoleUserId(user?.id || "");
    setSelectedRoleId(user?.role?.id || "");
  };

  const handleUpdateRole = async () => {
    if (!editingRoleUserId || !selectedRoleId) {
      showError("Validation Error", "Vui lòng chọn role để cập nhật");
      return;
    }

    setIsUpdatingRole(true);
    try {
      await updateUserRoleService(editingRoleUserId, selectedRoleId);
      showSuccess("Update Role Success", "Đã cập nhật role thành công");
      setEditingRoleUserId("");
      setSelectedRoleId("");
      await loadUsers();

      if (selectedUser?.id === editingRoleUserId) {
        await handleViewDetail(editingRoleUserId);
      }
    } catch (error) {
      showError(
        "Update Role Failed",
        normalizeErrorMessage(error, "Không thể cập nhật role"),
      );
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id) return;

    const accepted = window.confirm(
      `Bạn chắc chắn muốn xóa user \"${user?.userName || user?.email}\"?`,
    );
    if (!accepted) return;

    setIsDeleting(true);
    try {
      await deleteUserService(user.id);
      showSuccess("Delete User Success", "Đã xóa user thành công");
      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }
      await loadUsers();
    } catch (error) {
      showError(
        "Delete User Failed",
        normalizeErrorMessage(error, "Không thể xóa user"),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <h1 className="text-2xl font-bold text-slate-100">
          Quản lý người dùng
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Quản lý danh sách người dùng, xem chi tiết, cập nhật role và xóa người
          dùng.
        </p>
      </section>

      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <form
          onSubmit={handleSearch}
          className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_auto]"
        >
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tim theo userName, name, email..."
            className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
          />

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-lg border border-[#2f3652] bg-[#0f1320] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
          >
            <option value="">Tất cả role</option>
            {roleNameFilters.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Tìm kiếm
          </button>
        </form>

        {isLoading ? (
          <div className="rounded-lg border border-dashed border-[#2f3652] p-8 text-center text-slate-400">
            Đang tải danh sách người dùng...
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#2f3652] p-8 text-center text-slate-400">
            Không có người dùng nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-[#2a2f45] text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#1f2438]">
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-100">
                        {user.name || "-"}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        @{user.userName}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{user.email}</td>
                    <td className="px-3 py-3">
                      {editingRoleUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRoleId}
                            onChange={(event) =>
                              setSelectedRoleId(event.target.value)
                            }
                            className="rounded-md border border-[#2f3652] bg-[#0f1320] px-2 py-1 text-xs text-slate-100 outline-none"
                          >
                            <option value="">Chọn role</option>
                            {roleOptions.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleUpdateRole}
                            disabled={isUpdatingRole}
                            className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoleUserId("");
                              setSelectedRoleId("");
                            }}
                            className="rounded-md border border-[#2f3652] px-2 py-1 text-xs font-medium text-slate-200 hover:bg-[#23263a]"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs font-semibold text-cyan-200">
                          {user?.role?.name || "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(user.id)}
                          className="rounded-md border border-[#2f3652] px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-[#23263a]"
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditRole(user)}
                          className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
                        >
                          Sửa role
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={isDeleting}
                          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-500 disabled:opacity-60"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Tổng {totalItem} user • Trang {page}/{Math.max(totalPage, 1)}
          </p>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-md border border-[#2f3652] bg-[#0f1320] px-2 py-1 text-xs text-slate-100 outline-none"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>

            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-md border border-[#2f3652] px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-[#23263a] disabled:opacity-50"
            >
              Truoc
            </button>

            {pageItems.map((item, index) =>
              item === "..." ? (
                <span key={`ellipsis-${index}`} className="px-1 text-xs text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    page === item
                      ? "bg-cyan-600 text-white"
                      : "border border-[#2f3652] text-slate-200 hover:bg-[#23263a]"
                  }`}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={page >= totalPage}
              onClick={() => setPage((prev) => Math.min(totalPage, prev + 1))}
              className="rounded-md border border-[#2f3652] px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-[#23263a] disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#23263a] bg-[#151925] p-5">
        <h2 className="text-lg font-semibold text-slate-100">Chi tiet user</h2>

        {isDetailLoading ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#2f3652] p-5 text-sm text-slate-400">
            Đang tải chi tiết người dùng...
          </div>
        ) : !selectedUser ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#2f3652] p-5 text-sm text-slate-400">
            Chọn một người dùng để xem chi tiết.
          </div>
        ) : (
          <div className="mt-3 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
            <div className="rounded-lg border border-[#23263a] bg-[#0f1320] p-3">
              <p className="text-xs text-slate-400">User ID</p>
              <p className="mt-1 break-all">{selectedUser.id}</p>
            </div>
            <div className="rounded-lg border border-[#23263a] bg-[#0f1320] p-3">
              <p className="text-xs text-slate-400">User Name</p>
              <p className="mt-1">{selectedUser.userName || "-"}</p>
            </div>
            <div className="rounded-lg border border-[#23263a] bg-[#0f1320] p-3">
              <p className="text-xs text-slate-400">Ho ten</p>
              <p className="mt-1">{selectedUser.name || "-"}</p>
            </div>
            <div className="rounded-lg border border-[#23263a] bg-[#0f1320] p-3">
              <p className="text-xs text-slate-400">Email</p>
              <p className="mt-1">{selectedUser.email || "-"}</p>
            </div>
            <div className="rounded-lg border border-[#23263a] bg-[#0f1320] p-3">
              <p className="text-xs text-slate-400">So dien thoai</p>
              <p className="mt-1">{selectedUser.phoneNumber || "-"}</p>
            </div>
            <div className="rounded-lg border border-[#23263a] bg-[#0f1320] p-3">
              <p className="text-xs text-slate-400">Role</p>
              <p className="mt-1">{selectedUser?.role?.name || "-"}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserManagementPage;
