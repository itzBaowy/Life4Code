export const menuConfig = [
    {
        category: "CORE",
        items: [
            {
                id: "dashboard",
                label: "Tổng Quan",
                path: "dashboard",
                roles: ["admin", "user"],
            },
            {
                id: "course-management",
                label: "Quản lý khoá học",
                path: "courses",
                roles: ["admin"],
            },
            {
                id: "user-management",
                label: "Quản lý người dùng",
                path: "users",
                roles: ["admin"],
            },
            {
                id: "my-courses",
                label: "Khoá học của tôi",
                path: "my-courses",
                roles: ["user"],
            },
        ],
    },
];

const getAllMenuItems = () => {
    const items = [];

    menuConfig.forEach((group) => {
        (group.items || []).forEach((item) => {
            items.push(item);

            if (Array.isArray(item.subItems)) {
                items.push(...item.subItems);
            }
        });
    });

    return items;
};

const getAllowedByRole = (roleName) => {
    const normalizedRole = String(roleName || '').toLowerCase();
    const allowed = new Set();

    getAllMenuItems().forEach((item) => {
        const roles = Array.isArray(item.roles) ? item.roles : [];
        if (!roles.length || roles.includes(normalizedRole)) {
            allowed.add(item.id);
        }
    });

    return allowed;
};

// Build a set of route ids user can access based on role/permissions.
export const buildMenuByPermissions = (user) => {
    if (!user) return new Set();

    const roleName = String(user.role || "").toLowerCase();
    const allowed = getAllowedByRole(roleName);
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];

    permissions.forEach((perm) => {
        if (!perm) return;

        if (typeof perm === "string") {
            if (allowed.has(perm)) {
                allowed.add(perm);
            }
            return;
        }

        if (typeof perm === "object") {
            if (perm.id && allowed.has(perm.id)) allowed.add(perm.id);
            if (perm.name && allowed.has(perm.name)) allowed.add(perm.name);
            if (perm.code && allowed.has(perm.code)) allowed.add(perm.code);
            if (perm.menuId && allowed.has(perm.menuId)) allowed.add(perm.menuId);
        }
    });

    return allowed;
};
