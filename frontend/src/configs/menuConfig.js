export const menuConfig = [
    {
        category: "CORE",
        items: [
            {
                id: "dashboard",
                label: "Tổng Quan",
                path: "dashboard",
            },
            {
                id: "course-management",
                label: "Quản lý khoá học",
                path: "courses",
            },
            {
                id: "my-courses",
                label: "Khoá học của tôi",
                path: "my-courses",
            },
        ],
    },
];

// Build a set of route ids user can access based on role/permissions.
export const buildMenuByPermissions = (user) => {
    if (!user) return new Set();

    const roleName = String(user.role || "").toLowerCase();
    if (roleName === "admin") return "ALL";

    const allowed = new Set(["dashboard", "my-courses"]);
    const permissions = Array.isArray(user.permissions) ? user.permissions : [];

    permissions.forEach((perm) => {
        if (!perm) return;

        if (typeof perm === "string") {
            allowed.add(perm);
            return;
        }

        if (typeof perm === "object") {
            if (perm.id) allowed.add(perm.id);
            if (perm.name) allowed.add(perm.name);
            if (perm.code) allowed.add(perm.code);
            if (perm.menuId) allowed.add(perm.menuId);
        }
    });

    return allowed;
};
