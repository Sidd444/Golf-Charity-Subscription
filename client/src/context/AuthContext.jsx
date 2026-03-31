import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import server_url from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['x-auth-token'] = token;
            try {
                const res = await axios.get(`${server_url}/api/users/me`);
                setUser(res.data);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => { loadUser(); }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${server_url}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        await loadUser();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};