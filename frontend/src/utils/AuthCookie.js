import Cookies from "js-cookie";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const setTokens = ({ accessToken, refreshToken }) => {
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
        secure: true,
        sameSite: "strict",
    });

    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
        secure: true,
        sameSite: "strict",
    });
};

const clearAccessTokens = () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
};

const clearRefreshToken = () => {
    Cookies.remove(REFRESH_TOKEN_KEY);
};

const getAccessToken = () => {
    return Cookies.get(ACCESS_TOKEN_KEY);
};

const getRefreshToken = () => {
    return Cookies.get(REFRESH_TOKEN_KEY);
};

export const authCookie = {
    setTokens,
    clearAccessTokens,
    clearRefreshToken,
    getAccessToken,
    getRefreshToken,
};
